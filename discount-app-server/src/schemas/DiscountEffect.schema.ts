import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DiscountAmount } from './DiscountAmount.schema';

@Schema()
export class DiscountEffect {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountAmount' })
  @Prop({ required: false })
  discountAmount: DiscountAmount;
  @Prop({ required: false })
  percentage: number;
}
export const DiscountEffectSchema =
  SchemaFactory.createForClass(DiscountEffect);
