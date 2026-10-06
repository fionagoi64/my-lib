import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRuleDto {
  @ApiProperty({
    example: '📚 Borrowing Limits',
    description: 'The title/category of the library rule FAQ.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Readers can check out a maximum of 5 concurrent books at any time.',
    description: 'The full text or guideline specifications.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
