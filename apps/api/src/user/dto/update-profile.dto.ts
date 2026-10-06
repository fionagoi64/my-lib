import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class UpdateProfileDto {
  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Transform(trim)
  phone?: string;

  @ApiProperty({ example: '123 Main St, New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  @Transform(trim)
  address?: string;

  @ApiProperty({ example: 'https://avatar.url/avatar.png', required: false })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2_048)
  @Transform(trim)
  avatarUrl?: string;

  @ApiProperty({ example: 'Avid reader and book lover.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(trim)
  bio?: string;
}
