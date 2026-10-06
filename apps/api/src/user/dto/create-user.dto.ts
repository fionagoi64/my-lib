import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'fiona@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Fiona',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Goi',
    required: false,
  })
  lastName?: string;
}
