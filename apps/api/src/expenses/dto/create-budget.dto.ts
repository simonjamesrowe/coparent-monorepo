import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Matches } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Expense category ID' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'Budget month (YYYY-MM)', example: '2026-02' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in format YYYY-MM' })
  month!: string;

  @ApiProperty({ description: 'Budget limit amount' })
  @IsNumber()
  limit!: number;
}
