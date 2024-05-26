import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class DiscountAmountDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  @IsNotEmpty()
  @IsBoolean()
  appliesOnEachItem: boolean;
}
