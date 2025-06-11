import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
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

export class SizeQuantityDto {
  @ApiProperty({ description: 'Size name' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ description: 'Quantity available for this size' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number;
}

export class ProductImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsArray()
  @IsString({ each: true })
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

  @ApiProperty({
    description: 'Size and quantity mapping',
    type: [SizeQuantityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeQuantityDto)
  @IsNotEmpty()
  sizeQuantities: SizeQuantityDto[];
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
    description: 'Product URL slug',
    required: false,
    example: 'san-pham-abc-123',
  })
  @IsOptional()
  @IsString()
  slug?: string;

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

  @ApiProperty({
    description: 'Product is deleted',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
