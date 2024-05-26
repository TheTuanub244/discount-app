import {
  IsBoolean,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { DiscountItemsDto } from '../level-1/create-discountItem.dto';
import { Type } from 'class-transformer';
import { DiscountCustomerGetsValuesDto } from './create-discountCustomerGetsValue.dto';

export class DiscountCustomerGetsDto {
  @IsBoolean()
  appliesOnOneTimePurchase: boolean;
  @IsBoolean()
  appliesOnSubscription: boolean;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountItemsDto)
  item: DiscountItemsDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountCustomerGetsValuesDto)
  value: DiscountCustomerGetsValuesDto;
}
