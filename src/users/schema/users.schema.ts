import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true})
  password: string;
  
  @Prop({ required: true})
  th_firstname: string;
  
  @Prop({ required: true})
  th_lastname: string;

  @Prop()
  en_firstname: string; 

  @Prop()
  en_lastname: string;

  @Prop({ unique: true})
  id_num: string;

  @Prop()
  laser_code: string;
  
  @Prop({ required: true, unique: true})
  email: string;
  
  @Prop({ required: true, unique: true})
  phone: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
