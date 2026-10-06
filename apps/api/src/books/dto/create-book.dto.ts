import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Hobbit' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'J.R.R. Tolkien' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({ example: '978-0261102217', required: false })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiProperty({ example: 'A classic fantasy novel.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stockTotal: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  categoryId: number;
}
