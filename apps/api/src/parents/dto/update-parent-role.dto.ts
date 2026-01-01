import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateParentRoleDto {
  @ApiProperty({
    description: 'The role to assign to the parent',
    enum: ['primary', 'co-parent'],
    example: 'co-parent',
  })
  @IsEnum(['primary', 'co-parent'])
  role!: 'primary' | 'co-parent';
}
