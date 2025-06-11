import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class SizeQuantity {
  @ApiProperty({ description: 'Size name' })
  @Prop({ required: true, type: String })
  size: string;

  @ApiProperty({ description: 'Quantity available for this size' })
  @Prop({ required: true, type: Number, default: 0 })
  quantity: number;
}

export type SizeQuantityDocument = SizeQuantity & Document;
export const SizeQuantitySchema = SchemaFactory.createForClass(SizeQuantity);

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

  @ApiProperty({ description: 'Size and quantity mapping' })
  @Prop({ type: [SizeQuantitySchema], default: [] })
  sizeQuantities: SizeQuantity[];
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

  @ApiProperty({ description: 'Product slug' })
  @Prop({ type: String })
  slug: string;

  @ApiProperty({ description: 'Product is deleted' })
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export type ProductDocument = Product & Document;

export const ProductSchema = SchemaFactory.createForClass(Product);
