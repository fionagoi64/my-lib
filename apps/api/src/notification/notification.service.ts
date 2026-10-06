import { Injectable, NotFoundException, BadRequestException, MessageEvent } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly streams = new Map<string, Set<Subject<MessageEvent>>>();

  constructor(private prisma: PrismaService) {}

  streamForUser(userId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const stream = new Subject<MessageEvent>();
      const userStreams = this.streams.get(userId) ?? new Set<Subject<MessageEvent>>();
      userStreams.add(stream);
      this.streams.set(userId, userStreams);

      const subscription = stream.subscribe(subscriber);
      return () => {
        subscription.unsubscribe();
        this.disconnectStream(userId, stream);
      };
    });
  }

  disconnectStream(userId: string, stream: Subject<MessageEvent>) {
    const userStreams = this.streams.get(userId);
    userStreams?.delete(stream);
    stream.complete();
    if (userStreams?.size === 0) this.streams.delete(userId);
  }

  private publish(userId: string, notification: object) {
    this.streams.get(userId)?.forEach((stream) => stream.next({ type: 'notification', data: notification }));
  }

  // Get notifications for a specific user
  async getNotificationsForUser(userId: string, query: NotificationQueryDto) {
    const where = { userId, deletedAt: null, ...(query.unreadOnly === 'true' ? { isRead: false } : {}) };
    if (query.page !== undefined && query.limit !== undefined) {
      const [data, total] = await Promise.all([
        this.prisma.notification.findMany({ where, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.notification.count({ where }),
      ]);
      return { data, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
    }
    return this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSummary(userId: string) {
    const unread = await this.prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } });
    return { unread };
  }

  // Mark a specific notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Mark all notifications as read for a specific user
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Send notification (direct or broadcast)
  async sendNotification(dto: SendNotificationDto) {
    const { title, message, type, userId, broadcast } = dto;

    if (broadcast) {
      // Broadcast to all active users (standard readers and admins alike)
      const users = await this.prisma.user.findMany({
        select: { id: true },
      });

      if (users.length === 0) {
        return { count: 0 };
      }

      const notificationData = users.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
      }));

      const notifications = await this.prisma.$transaction(
        notificationData.map((data) => this.prisma.notification.create({ data })),
      );
      notifications.forEach((notification) => this.publish(notification.userId, notification));
      return { count: notifications.length };
    } else {
      if (!userId) {
        throw new BadRequestException('Recipient userId must be specified if broadcast is false.');
      }

      // Check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      });
      this.publish(notification.userId, notification);
      return notification;
    }
  }

  // Delete a notification (soft delete)
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() },
    });
  }
}
