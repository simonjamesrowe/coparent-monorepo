import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({
    description: 'Full name of the child',
    example: 'Emma Smith',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Date of birth (ISO 8601 format)',
    example: '2018-05-15',
  })
  @IsDateString()
  dateOfBirth!: string;

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
