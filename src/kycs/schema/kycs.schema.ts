import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KycDocument = Kyc & Document;

@Schema()
export class Kyc {
  @Prop({ required: true })
  kycId: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  front_image: string;

  @Prop()
  back_image: string;

  @Prop()
  face_image: string;

  @Prop()
  picture_feats: Array<Array<number>>;

  // true : Finish
  @Prop()
  kyc_result: boolean;
}

export const KycSchema = SchemaFactory.createForClass(Kyc);
