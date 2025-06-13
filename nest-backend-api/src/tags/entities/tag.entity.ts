import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
