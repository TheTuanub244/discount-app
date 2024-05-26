import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateIf } from 'class-validator';

export class DiscountProductsInputDto {
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  productVariantsToAdd: Array<string>;
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  productVariantsToRemove: Array<string>;
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  productsToAdd: Array<string>;
  @IsArray()
  @ApiProperty({ required: false })
  @ValidateIf(
    (o, value) => value !== null && value !== undefined && value !== '',
  )
  productsToRemove: Array<string>;
}
