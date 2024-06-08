import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { BasicDetail } from './BasicDetails.schema';
import { DiscountCustomerGets } from './DiscountCustomerGets.schema';
import { DiscountMinimumRequirement } from './DiscountMinimumRequirement.schema';
@Schema()
export class DiscountCodeBasic {
  @Prop()
  recurringCycleLimit: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BasicDetail' })
  basicDetail: BasicDetail;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCustomerGets' })
  discountCustomerGets: DiscountCustomerGets;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountMinimumRequirement',
    required: false,
  })
  discountMinimumRequirement: DiscountMinimumRequirement;
}
export const DiscountCodeBasicSchema =
  SchemaFactory.createForClass(DiscountCodeBasic);
