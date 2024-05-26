import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountAmountDto } from '../level-1/create-discountAmount.dto';
import { DiscountOnQuantityDto } from './create-discountOnQuantity.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountCustomerGetsValuesDto {
  @ValidateNested()
  @IsObject()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountAmountDto)
  discountAmount: DiscountAmountDto;
  @ValidateNested()
  @IsObject()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountOnQuantityDto)
  discountOnQuantity: DiscountOnQuantityDto;
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @IsNumber()
  percentage: number;
}
