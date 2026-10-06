import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRuleDto {
  @ApiProperty({
    example: '📚 Borrowing Limits',
    description: 'The title/category of the library rule FAQ.',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: 'Readers can check out a maximum of 5 concurrent books at any time.',
    description: 'The full text or guideline specifications.',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
