import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateExpenseStatusDto {
  @ApiProperty({
    description: 'New expense status',
    enum: ['approved', 'denied', 'reimbursed'],
  })
  @IsEnum(['approved', 'denied', 'reimbursed'])
  status!: 'approved' | 'denied' | 'reimbursed';
}
