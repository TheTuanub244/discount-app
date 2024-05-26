import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DiscountMinimumRequirement } from './DiscountMinimumRequirement.schema';
import { DiscountShippingDestinationSelection } from './DiscountShippingDestinationSelection.schema';
import { BasicDetail } from './BasicDetails.schema';
@Schema()
export class DiscountCodeFreeShipping {
  @Prop()
  appliesOnOneTimePurchase: boolean;
  @Prop()
  appliesOnSubscription: boolean;
  @Prop()
  maximumShippingPrice: number;
  @Prop()
  recurringCycleLimit: number;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountMinimumRequirement',
  })
  discountMinimumRequirement: DiscountMinimumRequirement;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BasicDetail' })
  basicDetail: BasicDetail;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountShippingDestinationSelection',
  })
  destination: DiscountShippingDestinationSelection;
}
export const DiscountCodeFreeShippingSchema = SchemaFactory.createForClass(
  DiscountCodeFreeShipping,
);
