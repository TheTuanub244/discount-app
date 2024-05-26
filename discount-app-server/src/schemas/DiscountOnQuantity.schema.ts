import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DiscountEffect } from './DiscountEffect.schema';
import mongoose from 'mongoose';

@Schema()
export class DiscountOnQuantity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountEffect' })
  @Prop({ required: false })
  effect: DiscountEffect;
  @Prop()
  quantity: number;
}
export const DiscountOnQuantitySchema =
  SchemaFactory.createForClass(DiscountOnQuantity);
