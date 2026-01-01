import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsTimeZone } from 'class-validator';

export class CreateFamilyDto {
  @ApiProperty({
    description: 'The name of the family',
    example: 'The Smith Family',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'The time zone for the family',
    example: 'America/New_York',
  })
  @IsString()
  @IsTimeZone()
  timeZone!: string;
}
