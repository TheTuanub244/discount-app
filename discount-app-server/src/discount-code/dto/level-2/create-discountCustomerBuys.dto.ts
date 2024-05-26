import { IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import { DiscountItemsDto } from '../level-1/create-discountItem.dto';
import { Type } from 'class-transformer';
import { DiscountCustomerBuysValueDto } from '../level-1/create-discountCustomerBuysValue.dto';

export class DiscountCustomerBuysDto {
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountItemsDto)
  item?: DiscountItemsDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountCustomerBuysValueDto)
  value?: DiscountCustomerBuysValueDto;
}
