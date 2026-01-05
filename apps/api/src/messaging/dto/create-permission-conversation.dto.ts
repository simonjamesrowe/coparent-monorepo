import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionConversationDto {
  @ApiPropertyOptional({
    description: 'Subject for the permission request',
    example: 'Soccer camp registration',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Permission request type',
    example: 'extracurricular',
  })
  @IsString()
  @IsIn(['medical', 'travel', 'schedule', 'extracurricular'])
  type!: 'medical' | 'travel' | 'schedule' | 'extracurricular';

  @ApiPropertyOptional({
    description: 'Child ID for the request',
    example: '6565aaf0f2a4b2c9c1c3a888',
  })
  @IsOptional()
  @IsString()
  childId?: string;

  @ApiPropertyOptional({
    description: 'Child name if ID is not provided',
    example: 'Emma Martinez',
  })
  @IsOptional()
  @IsString()
  childName?: string;

  @ApiProperty({
    description: 'Permission request details',
    example: 'Requesting approval for summer camp registration and cost details.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
