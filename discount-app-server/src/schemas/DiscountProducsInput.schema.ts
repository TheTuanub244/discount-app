import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class DiscountProductsInput {
  @Prop()
  productVariantsToAdd: Array<string>;
  @Prop()
  productVariantsToRemove: Array<string>;
  @Prop()
  productsToAdd: Array<string>;
  @Prop()
  productsToRemove: Array<string>;
}
export const DiscountProductsInputSchema = SchemaFactory.createForClass(
  DiscountProductsInput,
);
