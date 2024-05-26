import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BasicDetail } from './BasicDetails.schema';
import { DiscountCustomerBuys } from './DiscountCustomerBuys.schema';
import { DiscountCustomerGets } from './DiscountCustomerGets.schema';
@Schema()
export class DiscountAutomaticBxGy {
  @Prop()
  usesPerOrderLimit: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BasicDetail' })
  basicDetail: BasicDetail;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCustomerBuys' })
  discountCustomerBuys: DiscountCustomerBuys;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCustomerGets' })
  discountCustomerGets: DiscountCustomerGets;
}
export const DiscountAutomaticBxGySchema = SchemaFactory.createForClass(
  DiscountAutomaticBxGy,
);
