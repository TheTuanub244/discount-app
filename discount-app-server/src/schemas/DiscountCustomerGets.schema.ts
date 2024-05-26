import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DiscountItems } from './DiscountItems.schema';
import { DiscountCustomerGetsValue } from './DiscountCustomerGetsValue.schema';
@Schema()
export class DiscountCustomerGets {
  @Prop()
  appliesOnOnetimePurchase: boolean;
  @Prop()
  appliesOnSubscription: boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountItems' })
  item: DiscountItems;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountCustomerGetsValue',
  })
  value: DiscountCustomerGetsValue;
}
export const DiscountCustomerGetsSchema =
  SchemaFactory.createForClass(DiscountCustomerGets);
