import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProposedChangeDto {
  @ApiProperty({
    description: 'Type of change',
    enum: ['swap', 'extend', 'add', 'remove'],
    example: 'swap',
  })
  @IsEnum(['swap', 'extend', 'add', 'remove'])
  type!: 'swap' | 'extend' | 'add' | 'remove';

  @ApiPropertyOptional({
    description: 'Original start date (ISO 8601 format)',
    example: '2025-01-17',
  })
  @IsOptional()
  @IsString()
  originalStartDate?: string;

  @ApiPropertyOptional({
    description: 'Original end date (ISO 8601 format)',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsString()
  originalEndDate?: string;

  @ApiProperty({
    description: 'New start date (ISO 8601 format)',
    example: '2025-01-18',
  })
  @IsString()
  @IsNotEmpty()
  newStartDate!: string;

  @ApiProperty({
    description: 'New end date (ISO 8601 format)',
    example: '2025-01-21',
  })
  @IsString()
  @IsNotEmpty()
  newEndDate!: string;
}

export class CreateScheduleChangeRequestDto {
  @ApiPropertyOptional({
    description: 'Original event ID being modified (null for new event requests)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  originalEventId?: string | null;

  @ApiProperty({
    description: 'Proposed change details',
    type: ProposedChangeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ProposedChangeDto)
  proposedChange!: ProposedChangeDto;

  @ApiProperty({
    description: 'Reason for the schedule change request',
    example: 'I have a work conference on Friday the 17th that I can\'t reschedule.',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
