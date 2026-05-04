import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateStatementDto {
  @ApiProperty({ description: 'Account ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiProperty({ description: 'File name', example: 'statement-jan-2026.csv' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ description: 'Period start date', example: '2026-01-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ description: 'Period end date', example: '2026-01-31' })
  @IsDateString()
  periodEnd!: string;

  @ApiPropertyOptional({ description: 'Mapping template ID' })
  @IsOptional()
  @IsString()
  mappingTemplateId?: string;
}
