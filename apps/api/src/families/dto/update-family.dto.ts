import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsTimeZone } from 'class-validator';

export class UpdateFamilyDto {
  @ApiPropertyOptional({
    description: 'The name of the family',
    example: 'The Smith Family',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The time zone for the family',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  @IsTimeZone()
  timeZone?: string;
}
