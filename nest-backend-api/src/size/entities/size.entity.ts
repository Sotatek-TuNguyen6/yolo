import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type SizeDocument = Size & Document;
@Schema({ timestamps: true })
export class Size {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  name: string;
}

export const SizeSchema = SchemaFactory.createForClass(Size);
