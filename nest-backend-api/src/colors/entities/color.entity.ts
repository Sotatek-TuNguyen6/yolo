import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type ColorDocument = Color & Document;

@Schema({ timestamps: true })
export class Color {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  @ApiProperty()
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    match: /^#([0-9a-fA-F]{6})$/,
  })
  @ApiProperty()
  value: string;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
