import { IsBoolean, IsNotEmpty } from 'class-validator';
export class DiscountShippingDestinationSelectionDto {
  @IsBoolean()
  @IsNotEmpty()
  all: boolean;
}
