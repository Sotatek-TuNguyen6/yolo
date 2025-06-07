import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  url: string[];

  @ApiProperty({ description: 'Color name associated with the image' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Color code (hex, rgb, etc)' })
  @IsString()
  @IsNotEmpty()
  colorCode: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Size' })
  @IsString()
  @IsNotEmpty()
  size: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Auto incremented product ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product images with associated colors',
    type: [ProductImageDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiProperty({
    description: 'Image metadata for file uploads',
    type: 'array',
    required: false,
  })
  @IsOptional()
  @IsString()
  imagesMetaRaw?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  @IsMongoId()
  category: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'Product slug/detail',
    required: false,
  })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiProperty({
    description: 'Product stock quantity',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({
    description: 'Product discount percentage',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiProperty({
    description: 'Tag IDs',
    type: [String],
    required: false,
    example: ['60d21b4667d0d8992e610c85'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: mongoose.Types.ObjectId[];
}
