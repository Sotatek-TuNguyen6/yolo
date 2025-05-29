import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Cart & Document;
export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  @ApiProperty()
  product: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  @ApiProperty()
  quantities: number;

  @Prop({ type: Types.ObjectId, ref: 'Color', required: true })
  @ApiProperty()
  color: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Size', required: true })
  @ApiProperty()
  size: Types.ObjectId;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @ApiProperty()
  user: Types.ObjectId;

  @Prop({ type: [CartItemSchema], required: true })
  @ApiProperty({ type: [CartItem] })
  items: CartItemDocument[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
