import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'fiona@gmail.com',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Fiona',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    example: 'Goi',
    required: false,
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @IsOptional()
  @MaxLength(100)
  lastName?: string;
}
