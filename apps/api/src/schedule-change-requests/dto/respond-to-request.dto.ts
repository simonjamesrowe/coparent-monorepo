import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RespondToRequestDto {
  @ApiPropertyOptional({
    description: 'Response note from the approver/decliner',
    example: 'That works for me. Tell your parents I said hi!',
  })
  @IsOptional()
  @IsString()
  responseNote?: string;
}
