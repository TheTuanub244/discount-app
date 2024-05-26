import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class CombinesWith {
  @Prop({ required: false })
  productDiscounts?: boolean;
  @Prop({ required: false })
  orderDiscounts?: boolean;
  @Prop({ required: false })
  shippingDiscounts?: boolean;
}
export const CombinesWithSchema = SchemaFactory.createForClass(CombinesWith);
