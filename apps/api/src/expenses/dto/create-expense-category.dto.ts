import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'School Fees' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Category type',
    enum: ['predefined', 'custom'],
    example: 'custom',
  })
  @IsOptional()
  @IsEnum(['predefined', 'custom'])
  type?: 'predefined' | 'custom';

  @ApiProperty({ description: 'Color for UI display', example: 'lime' })
  @IsString()
  @IsNotEmpty()
  color!: string;
}
