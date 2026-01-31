import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RespondPermissionDto {
  @ApiPropertyOptional({
    description: 'Optional response notes',
    example: 'Approved. Please share the schedule details.',
  })
  @IsOptional()
  @IsString()
  response?: string;
}
