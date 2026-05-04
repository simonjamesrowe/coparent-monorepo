import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStatementLineDto {
  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'TESCO STORES 2345' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: -45.99 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Food & Groceries' })
  @IsOptional()
  @IsString()
  categoryGuess?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isChildExpense?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class CreateStatementLinesDto {
  @ApiProperty({ type: [CreateStatementLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStatementLineDto)
  lines!: CreateStatementLineDto[];
}
