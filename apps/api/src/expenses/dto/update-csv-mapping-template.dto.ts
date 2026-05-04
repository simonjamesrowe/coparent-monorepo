import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CsvMappingsDto } from './create-csv-mapping-template.dto';

export class UpdateCsvMappingTemplateDto {
  @ApiPropertyOptional({
    description: 'Account to associate with',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ description: 'Template name', example: 'Santander CC' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Column mappings', type: CsvMappingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CsvMappingsDto)
  mappings?: CsvMappingsDto;

  @ApiPropertyOptional({ description: 'CSV delimiter', example: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;

  @ApiPropertyOptional({ description: 'Whether CSV has a header row', example: true })
  @IsOptional()
  @IsBoolean()
  hasHeaderRow?: boolean;
}
