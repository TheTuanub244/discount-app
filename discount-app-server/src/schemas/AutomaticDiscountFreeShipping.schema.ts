import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DiscountMinimumRequirement } from './DiscountMinimumRequirement.schema';
import { DiscountShippingDestinationSelection } from './DiscountShippingDestinationSelection.schema';
import { BasicDetail } from './BasicDetails.schema';
@Schema()
export class AutomaticDiscountFreeShipping {
  @Prop({ required: false })
  appliesOnOneTimePurchase: boolean;
  @Prop({ required: false })
  appliesOnSubscription: boolean;
  @Prop({ required: false })
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
export const AutomaticDiscountFreeShippingSchema = SchemaFactory.createForClass(
  AutomaticDiscountFreeShipping,
);
