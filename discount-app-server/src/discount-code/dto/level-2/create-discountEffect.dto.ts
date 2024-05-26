import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountAmountDto } from '../level-1/create-discountAmount.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountEffectDto {
  @ValidateNested()
  @IsObject()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountAmountDto)
  discountAmount: DiscountAmountDto;
  @IsNotEmpty()
  @IsNumber()
  percentage: number;
}
