import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductImage {
  @ApiProperty({ description: 'Image URL' })
  @Prop({ required: true, type: [String] })
  url: string[];

  @ApiProperty({ description: 'Color name associated with the image' })
  @Prop({ required: true, type: String })
  color: string;

  @ApiProperty({ description: 'Color code (hex, rgb, etc)' })
  @Prop({ required: true, type: String })
  colorCode: string;

  @ApiProperty({ description: 'Quantity' })
  @Prop({ required: true, type: Number, default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Size' })
  @Prop({ required: true, type: [String] })
  size: string[];
}

export type ProductImageDocument = ProductImage & Document;
export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({ description: 'Auto incremented product ID' })
  @Prop({ required: true, unique: true })
  productId: number;

  @ApiProperty({ description: 'Product name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Product description' })
  @Prop({ required: false })
  description: string;

  @ApiProperty({ description: 'Product price' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({ description: 'Product images with associated colors' })
  @Prop({ type: [ProductImageSchema], default: [] })
  images: ProductImage[];

  // @ApiProperty({ description: 'Legacy product images field' })
  // @Prop({ type: [String], default: [] })
  // legacyImages: string[];

  @ApiProperty({ description: 'Product category' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @ApiProperty({ description: 'Product slug' })
  @Prop({ type: String })
  detail: string;

  @ApiProperty({ description: 'Product stock' })
  @Prop({ type: Number, default: 0 })
  stock: number;

  @ApiProperty({ description: 'Product discount percent' })
  @Prop({ type: Number, default: 0 })
  discountPercent: number;

  @ApiProperty({ description: 'Product tags' })
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    default: [],
  })
  tags: Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
