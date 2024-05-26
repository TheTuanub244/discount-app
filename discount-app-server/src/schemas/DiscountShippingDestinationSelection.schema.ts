import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class DiscountShippingDestinationSelection {
  @Prop()
  all: boolean;
}
export const DiscountShippingDestinationSelectionSchema =
  SchemaFactory.createForClass(DiscountShippingDestinationSelection);
