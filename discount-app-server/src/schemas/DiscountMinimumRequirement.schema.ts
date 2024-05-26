import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class DiscountMinimumRequirement {
  @Prop({ required: false })
  quantity: number;
  @Prop({ required: false })
  subtotal: number;
}
export const DiscountMinimumRequirementSchema = SchemaFactory.createForClass(
  DiscountMinimumRequirement,
);
