import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, ValidateIf } from 'class-validator';

export class DiscountMinimumRequirementDto {
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  quantity: number;
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  subtotal: number;
}
