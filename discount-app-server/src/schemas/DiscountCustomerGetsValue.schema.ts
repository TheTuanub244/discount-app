import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DiscountAmount } from './DiscountAmount.schema';
import mongoose from 'mongoose';
import { DiscountOnQuantity } from './DiscountOnQuantity.schema';

@Schema()
export class DiscountCustomerGetsValue {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountAmount' })
  @Prop({ required: false })
  discountAmount: DiscountAmount;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountOnQuantity' })
  @Prop({ required: false })
  discountOnQuantity: DiscountOnQuantity;
  @Prop({ required: false })
  percentage: number;
}
export const DiscountCustomerGetsValueSchema = SchemaFactory.createForClass(
  DiscountCustomerGetsValue,
);
