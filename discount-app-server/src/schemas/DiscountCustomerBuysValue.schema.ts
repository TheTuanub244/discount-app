import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class DiscountCustomerBuysValue {
  @Prop({ required: false })
  amount: number;
  @Prop({ required: false })
  quantity: number;
}
export const DiscountCustomerBuysValueSchema = SchemaFactory.createForClass(
  DiscountCustomerBuysValue,
);
