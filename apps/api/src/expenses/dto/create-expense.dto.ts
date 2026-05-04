import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export class CreateExpenseDto {
  @ApiPropertyOptional({ description: 'Child ID associated with this expense (optional)' })
  @IsOptional()
  @IsString()
  childId?: string | null;

  @ApiProperty({ description: 'Expense category ID' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'Expense amount' })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Date of expense (ISO 8601)', example: '2026-02-24' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Expense description' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Expense status',
    enum: ['draft', 'pending_approval', 'approved'],
  })
  @IsOptional()
  @IsEnum(['draft', 'pending_approval', 'approved'])
  status?: 'draft' | 'pending_approval' | 'approved';

  @ApiPropertyOptional({ description: 'Whether this expense requires approval from partner' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Source of expense', enum: ['manual', 'statement'] })
  @IsOptional()
  @IsEnum(['manual', 'statement'])
  source?: 'manual' | 'statement';

  @ApiPropertyOptional({ description: 'Statement line ID if sourced from statement' })
  @IsOptional()
  @IsString()
  sourceStatementLineId?: string;

  @ApiPropertyOptional({ description: 'URL to receipt/invoice' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
