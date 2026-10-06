import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@ApiTags('Notification Operations')
@Controller('notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('mine')
  @ApiOperation({
    summary: 'Get notifications for current user',
    description: 'Retrieves all notifications assigned to the currently logged in user.',
  })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMyNotifications(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Subscribe to the current reader notification stream',
    description: 'Server-sent events for new notifications. Send a Bearer token or access_token query parameter.',
  })
  stream(@Req() req: any): Observable<MessageEvent> {
    return this.notificationService.streamForUser(req.user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark a notification as read',
    description: 'Updates a specific notification status to read.',
  })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  markAsRead(@Req() req: any, @Param('id') notificationId: string) {
    const userId = req.user.sub;
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Updates all unread notifications status to read for the current user.',
  })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  markAllAsRead(@Req() req: any) {
    const userId = req.user.sub;
    return this.notificationService.markAllAsRead(userId);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'Send notification to specific reader or broadcast to all (Admin/Librarian only)',
    description: 'Creates a notification. Requires Admin or Librarian roles.',
  })
  @ApiResponse({ status: 201, description: 'Notification sent successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Soft deletes a specific notification.',
  })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  deleteNotification(@Req() req: any, @Param('id') notificationId: string) {
    const userId = req.user.sub;
    return this.notificationService.deleteNotification(notificationId, userId);
  }
}
