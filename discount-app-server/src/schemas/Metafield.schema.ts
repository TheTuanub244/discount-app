import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Metafield {
  @Prop()
  description: string;
  @Prop()
  id: string;
  @Prop()
  key: string;
  @Prop()
  namespace: string;
  @Prop()
  type: string;
  @Prop()
  value: string;
}
export const MetafieldSchema = SchemaFactory.createForClass(Metafield);
