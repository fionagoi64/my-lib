import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsIn(['USER', 'ADMIN', 'LIBRARIAN'])
  roleName: string;
}
