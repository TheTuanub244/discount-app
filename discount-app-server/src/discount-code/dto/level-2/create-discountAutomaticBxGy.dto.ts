import {
  IsNotEmpty,
  IsNumber,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { DiscountCustomerGetsDto } from './create-discountCustomerGets.dto';
import { DiscountCustomerBuysDto } from './create-discountCustomerBuys.dto';
import { BasicDetailDto } from './create-basicDetail.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountAutomaticBxGyDto {
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @IsNumber()
  usePerOrderLimit: number;

  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => BasicDetailDto)
  basicDetail: BasicDetailDto;

  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountCustomerBuysDto)
  discountCustomerBuys: DiscountCustomerBuysDto;

  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountCustomerGetsDto)
  discountCustomerGets: DiscountCustomerGetsDto;
}
