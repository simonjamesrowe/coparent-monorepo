import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageConversationDto {
  @ApiPropertyOptional({
    description: 'Subject for the conversation',
    example: 'School parent-teacher conference',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Initial message to start the conversation',
    example: 'Can you confirm the time for next Thursday?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({
    description: 'Recipient parent ID',
    example: '6565aaf0f2a4b2c9c1c3a999',
  })
  @IsOptional()
  @IsString()
  recipientId?: string;
}
