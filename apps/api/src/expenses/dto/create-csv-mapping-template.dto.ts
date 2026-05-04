import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CsvMappingsDto {
  @ApiProperty({ example: 'Date' })
  @IsString()
  @IsNotEmpty()
  dateColumn!: string;

  @ApiProperty({ example: 'Description' })
  @IsString()
  @IsNotEmpty()
  descriptionColumn!: string;

  @ApiProperty({ example: 'Amount' })
  @IsString()
  @IsNotEmpty()
  amountColumn!: string;

  @ApiProperty({ example: 'Category' })
  @IsString()
  @IsNotEmpty()
  categoryColumn!: string;
}

export class CreateCsvMappingTemplateDto {
  @ApiPropertyOptional({
    description: 'Account to associate with',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiProperty({ description: 'Template name', example: 'Santander CC' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Column mappings', type: CsvMappingsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CsvMappingsDto)
  mappings!: CsvMappingsDto;

  @ApiPropertyOptional({ description: 'CSV delimiter', example: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'Whether CSV has a header row', example: true })
  @IsOptional()
  @IsBoolean()
  hasHeaderRow?: boolean;
}
