import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ImageGroup {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
  })
  @ApiProperty({ type: String })
  color: Types.ObjectId;

  @Prop({
    type: [String],
  })
  @ApiProperty({ type: [String] })
  images: string[];
}

export const ImageGroupSchema = SchemaFactory.createForClass(ImageGroup);

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: Number,
    unique: true,
  })
  @ApiProperty({
    description: 'Custom product ID number',
    example: 10001,
  })
  productId: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  @ApiProperty()
  name: string;

  @Prop({
    type: String,
    trim: true,
  })
  @ApiProperty({
    required: false,
  })
  subContent: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @ApiProperty()
  content: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  featuredImage: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  summary: string;

  @Prop({
    type: Number,
    required: true,
  })
  @ApiProperty()
  originPrice: number;

  @Prop({
    type: Number,
  })
  @ApiProperty()
  price: number;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  @ApiProperty({
    required: false,
    default: 0,
    minimum: 0,
  })
  discount: number;

  @Prop({
    type: [ImageGroupSchema],
    required: true,
  })
  @ApiProperty({ type: [ImageGroup] })
  imageUrls: ImageGroup[];

  @Prop({
    type: Boolean,
    default: false,
  })
  @ApiProperty({
    required: false,
    default: false,
  })
  isFreeShip: boolean;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  @ApiProperty({
    required: false,
    default: 0,
  })
  views: number;

  @Prop({
    type: Number,
    default: 0,
  })
  @ApiProperty({
    required: false,
    default: 0,
  })
  ratingAverage: number;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
      },
    ],
    required: true,
  })
  @ApiProperty({
    type: String,
    isArray: true,
  })
  colors: Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  @ApiProperty()
  category: Types.ObjectId;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
      },
    ],
    required: true,
    validate: {
      validator: (val: []) => val.length > 0,
      message: 'Sizes must be at least 1 size',
    },
  })
  @ApiProperty()
  sizes: Types.ObjectId[];

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  @ApiProperty()
  availableQuantities: number;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    default: [],
  })
  @ApiProperty({
    type: Comment,
    required: false,
    isArray: true,
    default: [],
  })
  comments?: Comment[];

  @Prop({
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
  })
  @ApiProperty({
    type: User,
    required: false,
    isArray: true,
    default: [],
  })
  likes: mongoose.Types.ObjectId[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  @ApiProperty({
    type: Number,
    required: false,
    default: 0,
    minimum: 0,
  })
  unitsSold: number;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ])
  @ApiProperty({
    type: User,
    required: false,
    isArray: true,
    default: [],
  })
  usersSold: mongoose.Types.ObjectId[];

  @Prop({
    type: String,
  })
  @ApiProperty()
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true,
  })
  @ApiProperty()
  subCategory: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: false,
  })
  @ApiProperty({
    description: 'Flag indicating if product is deleted',
    default: false,
  })
  isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', async function (next) {
  if (!this.productId) {
    try {
      // Dùng this.constructor thay vì mongoose.model
      const ProductModel = this.constructor as mongoose.Model<ProductDocument>;
      const highestProduct = await ProductModel.findOne({}, { productId: 1 })
        .sort({ productId: -1 })
        .limit(1);

      const nextId = highestProduct?.productId
        ? highestProduct.productId + 1
        : 1;

      this.productId = nextId;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
