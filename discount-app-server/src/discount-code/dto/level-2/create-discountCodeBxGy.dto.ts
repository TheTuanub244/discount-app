import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { BasicDetailDto } from './create-basicDetail.dto';
import { DiscountCustomerBuysDto } from './create-discountCustomerBuys.dto';
import { DiscountCustomerGetsDto } from './create-discountCustomerGets.dto';
import { Type } from 'class-transformer';

export class DiscountCodeBxGyDto {
  @IsNumber()
  @IsNotEmpty()
  usesPerOrderLimit: number;
  @ValidateNested()
  @Type(() => BasicDetailDto)
  basicDetail: BasicDetailDto;
  @ValidateNested()
  @Type(() => DiscountCustomerBuysDto)
  discountCustomerBuys: DiscountCustomerBuysDto;
  @ValidateNested()
  @Type(() => DiscountCustomerGetsDto)
  discountCustomerGets: DiscountCustomerGetsDto;
}
