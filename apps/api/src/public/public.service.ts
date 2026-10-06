import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  getContactDetails() {
    return {
      email: process.env.LIBRARY_CONTACT_EMAIL || 'library@example.com',
      responseTime: 'We aim to reply within two library working days.',
    };
  }

  async createFeedback(feedback: CreateFeedbackDto) {
    await this.prisma.contactFeedback.create({ data: feedback });
    return { message: 'Feedback received successfully.' };
  }
}
