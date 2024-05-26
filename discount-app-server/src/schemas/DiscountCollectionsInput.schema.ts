import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class DiscountCollectionsInput {
  @Prop()
  add: Array<string>;
  @Prop()
  remove: Array<string>;
}
export const DiscountCollectionsInputSchema = SchemaFactory.createForClass(
  DiscountCollectionsInput,
);
