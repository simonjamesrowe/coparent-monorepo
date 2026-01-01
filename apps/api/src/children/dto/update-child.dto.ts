import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateChildDto {
  @ApiPropertyOptional({
    description: 'Full name of the child',
    example: 'Emma Smith',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601 format)',
    example: '2018-05-15',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Name of the school',
    example: 'Willow Creek Elementary',
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({
    description: 'Medical notes and allergies',
    example: 'Allergic to peanuts',
  })
  @IsOptional()
  @IsString()
  medicalNotes?: string;
}
