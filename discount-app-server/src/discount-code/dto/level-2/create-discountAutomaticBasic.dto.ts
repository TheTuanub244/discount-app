import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BasicDetailDto } from './create-basicDetail.dto';
import { DiscountCustomerGetsDto } from './create-discountCustomerGets.dto';
import { Type } from 'class-transformer';
import { DiscountMinimumRequirementDto } from '../level-1/create-discountMinimumRequirement.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountAutomaticBasicDto {
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
  @ValidateNested()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @IsObject()
  @Type(() => DiscountMinimumRequirementDto)
  discountMinimumRequirement: DiscountMinimumRequirementDto;
}
