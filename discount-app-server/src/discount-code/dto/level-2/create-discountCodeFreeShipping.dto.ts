import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { DiscountMinimumRequirementDto } from '../level-1/create-discountMinimumRequirement.dto';
import { DiscountShippingDestinationSelectionDto } from '../level-1/create-discountShippingDestinationSelection.dto';
import { Type } from 'class-transformer';
import { BasicDetailDto } from './create-basicDetail.dto';

export class DiscountCodeFreeShippingDto {
  @IsBoolean()
  @IsNotEmpty()
  appliesOnOneTimePurchase: boolean;
  @IsBoolean()
  @IsNotEmpty()
  appliesOnSubscription: boolean;
  @IsNumber()
  @IsNotEmpty()
  maximumShippingPrice: number;
  @IsNumber()
  @IsNotEmpty()
  recurringCycleLimit: number;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountMinimumRequirementDto)
  discountMinimumRequirement: DiscountMinimumRequirementDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => BasicDetailDto)
  basicDetail: BasicDetailDto;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountShippingDestinationSelectionDto)
  destination: DiscountShippingDestinationSelectionDto;
}
