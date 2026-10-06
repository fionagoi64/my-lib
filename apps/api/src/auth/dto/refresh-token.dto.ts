import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'your-refresh-token-here' })
  @IsNotEmpty()
  refreshToken: string;
}
