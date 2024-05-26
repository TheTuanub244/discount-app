import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CombinesWith } from './CombinesWith.schema';
import { STATUS } from '../constants/api.enums';
import { IsEnum } from 'class-validator';

export type BasicDetailDocument = HydratedDocument<BasicDetail>;

@Schema()
export class BasicDetail {
  @Prop({ required: true, unique: true })
  title?: string;
  @Prop({ required: false })
  code?: string;
  @Prop()
  startsAt?: string;
  @Prop({ required: false })
  endsAt?: string;
  @Prop({ type: String, enum: STATUS, default: STATUS.SCHEDULED })
  @IsEnum(STATUS)
  status?: string = '1';
  @Prop({ required: false })
  usageLimit: number;
  @Prop({ required: false })
  appliesOncePerCustomer: boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CombinesWith' })
  combinesWith: CombinesWith;
  @Prop({ required: false })
  usePerOrderLimit: number;
  @Prop({ required: false })
  type: string;
  @Prop({ required: false })
  method: string;
  @Prop({ required: false })
  summary: string;
  @Prop({ required: false })
  id: string;
}

export const BasicDetailSchema = SchemaFactory.createForClass(BasicDetail);
