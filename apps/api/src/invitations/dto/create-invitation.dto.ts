import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address of the co-parent to invite',
    example: 'coparent@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Role to assign to the invited co-parent',
    enum: ['primary', 'co-parent'],
    example: 'co-parent',
  })
  @IsEnum(['primary', 'co-parent'])
  role!: 'primary' | 'co-parent';
}
