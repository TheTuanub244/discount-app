import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountEffectDto } from './create-discountEffect.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountOnQuantityDto {
  @ValidateNested()
  @IsObject()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountEffectDto)
  effect: DiscountEffectDto;
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
