import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fiction' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fiction literature and stories.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
