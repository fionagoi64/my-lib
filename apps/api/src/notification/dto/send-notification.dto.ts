import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'Library Maintenance' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'The library will be closed this Sunday for maintenance.' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ example: 'INFO' })
  @IsNotEmpty()
  @IsString()
  type: string; // e.g. INFO, ALERT, DUE_DATE, SYSTEM

  @ApiProperty({ example: 'user-uuid-here', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  broadcast?: boolean;
}
