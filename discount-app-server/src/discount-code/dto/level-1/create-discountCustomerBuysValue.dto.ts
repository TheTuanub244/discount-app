import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class DiscountCustomerBuysValueDto {
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  amount: number;
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  quantity: number;
}
