import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @ApiProperty()
  user: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  @ApiProperty({ type: String })
  product: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @ApiProperty({
    type: String,
  })
  comment: string;

  @Prop({
    type: Number,
  })
  @ApiProperty({
    type: Number,
    required: false,
    default: 0,
    minimum: 0,
  })
  rating: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  })
  @ApiProperty({ type: String, required: false, default: null })
  commentRoot?: Types.ObjectId;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    default: [],
  })
  @ApiProperty({ type: [String], required: false, default: [] })
  reply: Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  })
  @ApiProperty({ type: [String], required: false, default: [] })
  likes?: Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
