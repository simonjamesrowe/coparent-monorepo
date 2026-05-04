import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Account type',
    enum: ['bank-account', 'credit-card'],
    example: 'bank-account',
  })
  @IsEnum(['bank-account', 'credit-card'])
  type!: 'bank-account' | 'credit-card';

  @ApiProperty({ description: 'Bank or card issuer name', example: 'Santander' })
  @IsString()
  @IsNotEmpty()
  bankName!: string;

  @ApiProperty({ description: 'Account display name', example: 'Joint Current Account' })
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @ApiProperty({ description: 'Last 4 digits of account/card number', example: '4521' })
  @IsString()
  @IsNotEmpty()
  last4!: string;

  @ApiProperty({
    description: 'Parent ID who owns this account',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  ownerParentId!: string;

  @ApiPropertyOptional({
    description: 'Bank account subtype',
    enum: ['checking', 'savings'],
    example: 'checking',
  })
  @IsOptional()
  @IsEnum(['checking', 'savings'])
  accountSubtype?: 'checking' | 'savings';

  @ApiPropertyOptional({
    description: 'Credit card type',
    enum: ['visa', 'mastercard', 'amex'],
    example: 'visa',
  })
  @IsOptional()
  @IsEnum(['visa', 'mastercard', 'amex'])
  cardType?: 'visa' | 'mastercard' | 'amex';
}
