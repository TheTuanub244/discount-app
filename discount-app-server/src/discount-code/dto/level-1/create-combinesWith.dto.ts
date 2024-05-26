import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, ValidateIf } from 'class-validator';

export class CombinesWithDto {
  @IsBoolean()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  orderDiscounts: boolean;
  @IsBoolean()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  productDiscounts: boolean;
  @IsBoolean()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  shippingDiscounts: boolean;
}
