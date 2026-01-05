import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Thanks for the update. I will follow up tomorrow.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
