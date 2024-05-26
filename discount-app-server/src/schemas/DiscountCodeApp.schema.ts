import mongoose from 'mongoose';
import { Metafield } from './Metafield.schema';
import { BasicDetail } from './BasicDetails.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class DiscountCodeApp {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Metafield' })
  metafield: Metafield;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BasicDetail' })
  basicDetail: BasicDetail;
}
export const DiscountCodeAppSchema =
  SchemaFactory.createForClass(DiscountCodeApp);
