import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountMinimumRequirementDto } from '../level-1/create-discountMinimumRequirement.dto';
import { DiscountShippingDestinationSelectionDto } from '../level-1/create-discountShippingDestinationSelection.dto';
import { Type } from 'class-transformer';
import { BasicDetailDto } from './create-basicDetail.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AutomaticDiscountFreeShippingDto {
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  appliesOnOneTimePurchase: boolean;
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  appliesOnSubscription: boolean;
  @IsNumber()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  maximumShippingPrice: number;
  @IsNumber()
  recurringCycleLimit: number;
  @ValidateNested()
  @IsObject()
  @IsNotEmptyObject()
  @Type(() => DiscountMinimumRequirementDto)
  discountMinimumRequirement!: DiscountMinimumRequirementDto;
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
