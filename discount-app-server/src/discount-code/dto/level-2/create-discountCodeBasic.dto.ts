import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { BasicDetailDto } from './create-basicDetail.dto';
import { DiscountCustomerGetsDto } from './create-discountCustomerGets.dto';
import { Type } from 'class-transformer';

export class DiscountCodebBasicDto {
  @IsNotEmpty()
  @IsNumber()
  recurringCycleLimit: number;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => BasicDetailDto)
  basicDetail: BasicDetailDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountCustomerGetsDto)
  discountCustomerGets: DiscountCustomerGetsDto;
}
