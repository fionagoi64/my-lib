import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('contact')
  @ApiOperation({ summary: 'Get public library contact details' })
  getContactDetails() {
    return this.publicService.getContactDetails();
  }

  @Post('contact/feedback')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send feedback to the library' })
  @ApiResponse({ status: 201, description: 'Feedback received.' })
  createFeedback(@Body() feedback: CreateFeedbackDto) {
    return this.publicService.createFeedback(feedback);
  }
}
