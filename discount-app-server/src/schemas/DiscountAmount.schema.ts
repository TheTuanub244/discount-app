import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class DiscountAmount {
  @Prop()
  amount: number;
  @Prop()
  appliesOnEachItem: boolean;
}
export const DiscountAmountSchema =
  SchemaFactory.createForClass(DiscountAmount);
