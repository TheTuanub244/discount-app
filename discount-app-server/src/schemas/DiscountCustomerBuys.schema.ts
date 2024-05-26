import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DiscountItems } from './DiscountItems.schema';
import { DiscountCustomerBuysValue } from './DiscountCustomerBuysValue.schema';

@Schema()
export class DiscountCustomerBuys {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountItems' })
  item: DiscountItems;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountCustomerBuysValue',
  })
  value: DiscountCustomerBuysValue;
}
export const DiscountCustomerBuysSchema =
  SchemaFactory.createForClass(DiscountCustomerBuys);
