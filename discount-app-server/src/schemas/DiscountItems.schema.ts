import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DiscountCollectionsInput } from './DiscountCollectionsInput.schema';
import mongoose from 'mongoose';
import { DiscountProductsInput } from './DiscountProducsInput.schema';
@Schema()
export class DiscountItems {
  @Prop({ required: false })
  all: boolean = false;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountCollectionsInput',
  })
  collections: DiscountCollectionsInput;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountProductsInput',
  })
  products: DiscountProductsInput;
}
export const DiscountItemsSchema = SchemaFactory.createForClass(DiscountItems);
