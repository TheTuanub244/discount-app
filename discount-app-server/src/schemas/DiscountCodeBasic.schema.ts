import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BasicDetail } from './BasicDetails.schema';
import { DiscountCustomerGets } from './DiscountCustomerGets.schema';
@Schema()
export class DiscountCodeBasic {
  @Prop()
  recurringCycleLimit: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BasicDetail' })
  basicDetail: BasicDetail;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCustomerGets' })
  discountCustomerGets: DiscountCustomerGets;
}
export const DiscountCodeBasicSchema =
  SchemaFactory.createForClass(DiscountCodeBasic);
