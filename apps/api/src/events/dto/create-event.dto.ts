import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecurringPatternDto {
  @ApiProperty({
    description: 'Frequency of recurrence',
    enum: ['daily', 'weekly'],
    example: 'weekly',
  })
  @IsEnum(['daily', 'weekly'])
  frequency!: 'daily' | 'weekly';

  @ApiPropertyOptional({
    description: 'Days of the week for weekly recurrence',
    example: ['monday', 'wednesday'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Type of event',
    example: 'activity',
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Soccer Practice',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Start date (ISO 8601 format)',
    example: '2025-01-15',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'End date (ISO 8601 format)',
    example: '2025-01-17',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Start time (HH:mm format)',
    example: '16:00',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time (HH:mm format)',
    example: '17:30',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({
    description: 'Whether this is an all-day event',
    example: false,
  })
  @IsBoolean()
  allDay!: boolean;

  @ApiPropertyOptional({
    description: 'Parent ID who owns this event (for custody events)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Parent IDs associated with this event',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parentIds?: string[];

  @ApiProperty({
    description: 'Child IDs associated with this event',
    example: ['507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsString({ each: true })
  childIds!: string[];

  @ApiPropertyOptional({
    description: 'Event location',
    example: 'Riverside Sports Complex',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Bring water bottle and shin guards',
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'Recurring pattern for the event',
    type: RecurringPatternDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RecurringPatternDto)
  recurring?: RecurringPatternDto | null;
}
