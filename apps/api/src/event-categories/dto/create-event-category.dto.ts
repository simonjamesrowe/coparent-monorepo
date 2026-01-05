import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEventCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Soccer',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Icon name',
    example: 'circle',
  })
  @IsString()
  @IsNotEmpty()
  icon!: string;

  @ApiPropertyOptional({
    description: 'Color theme',
    example: 'emerald',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a default category',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is a system category',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
