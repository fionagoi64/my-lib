import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RulesQueryDto } from './dto/rules-query.dto';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: RulesQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.q?.trim()
        ? {
            OR: [
              { title: { contains: query.q.trim(), mode: 'insensitive' as const } },
              { content: { contains: query.q.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    if (query.page !== undefined && query.limit !== undefined) {
      const [data, total] = await Promise.all([
        this.prisma.libraryRule.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.libraryRule.count({ where }),
      ]);
      return { data, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
    }

    return this.prisma.libraryRule.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async create(userId: string, createRuleDto: CreateRuleDto) {
    const rule = await this.prisma.libraryRule.create({
      data: {
        title: createRuleDto.title,
        content: createRuleDto.content,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    try {
      // Broadcast rule update notification to all users
      const allUsers = await this.prisma.user.findMany({ select: { id: true } });
      if (allUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: allUsers.map((u) => ({
            userId: u.id,
            type: 'RULE_UPDATE',
            title: 'New Library Rule Created',
            message: `A new library policy has been created: "${rule.title}". Please review it.`,
          })),
        });
      }
    } catch (err) {
      console.error('Failed to send rule update broadcast notification:', err);
    }

    return rule;
  }

  async update(id: number, userId: string, updateRuleDto: CreateRuleDto) {
    const rule = await this.prisma.libraryRule.findUnique({
      where: { id },
    });

    if (!rule || rule.deletedAt) {
      throw new NotFoundException('Library rule not found');
    }

    const updated = await this.prisma.libraryRule.update({
      where: { id },
      data: {
        title: updateRuleDto.title,
        content: updateRuleDto.content,
        updatedBy: userId,
      },
    });

    try {
      // Broadcast rule update notification to all users
      const allUsers = await this.prisma.user.findMany({ select: { id: true } });
      if (allUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: allUsers.map((u) => ({
            userId: u.id,
            type: 'RULE_UPDATE',
            title: 'Library Rule Revised',
            message: `The library policy "${updated.title}" has been updated. Please review the revisions.`,
          })),
        });
      }
    } catch (err) {
      console.error('Failed to send rule update broadcast notification:', err);
    }

    return updated;
  }

  async remove(id: number, userId: string) {
    const rule = await this.prisma.libraryRule.findUnique({
      where: { id },
    });

    if (!rule || rule.deletedAt) {
      throw new NotFoundException('Library rule not found');
    }

    return this.prisma.libraryRule.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }
}
