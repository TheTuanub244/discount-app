import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountCollectionsInputDto } from './create-discountCollectionsInput.schema';
import { DiscountProductsInputDto } from './create-discountProductsInput.schema';
import { ApiProperty } from '@nestjs/swagger';

export class DiscountItemsDto {
  @IsBoolean()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  all: boolean = false;
  @ValidateNested()
  @IsObject()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountCollectionsInputDto)
  collections?: DiscountCollectionsInputDto;
  @ValidateNested()
  @ApiProperty({ required: false })
  @IsObject()
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  @Type(() => DiscountProductsInputDto)
  products?: DiscountProductsInputDto;
}
