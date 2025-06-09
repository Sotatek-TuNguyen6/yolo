import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeliveryType, PaymentType } from 'src/enum';

export class AddressDetailsDto {
  @ApiProperty({ description: 'City', example: 'Thành phố Hà Nội' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'District', example: 'Huyện Đông Anh' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Ward', example: 'Xã Dục Tú' })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ description: 'Specific address', example: 'test' })
  @IsString()
  @IsNotEmpty()
  specificAddress: string;
}

export class ProductOrderDto {
  @ApiProperty({ description: 'Product ID', example: 16 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Quantity', example: 3 })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Selected Image ID',
    example: 'image_123',
    required: false,
  })
  @IsString()
  @IsOptional()
  selectedImageId?: string;

  @ApiProperty({
    description: 'Selected Size',
    example: 'M',
    required: false,
  })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({ description: 'Product name', example: 'Product Name' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ description: 'Discount percent', example: 10 })
  @IsNumber()
  @IsOptional()
  discountPercent?: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID (0 for guest)', example: 0 })
  @IsNumber()
  customerId: number;

  @ApiProperty({ description: 'Customer name', example: 'Nguyễn Đình Tư' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'nguyendinhtu11022002@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  customerEmail: string;

  @ApiProperty({ description: 'Customer phone number', example: '0988597401' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({
    description: 'Shipping address',
    example: 'test, Xã Dục Tú, Huyện Đông Anh, Thành phố Hà Nội',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ description: 'Address details', type: AddressDetailsDto })
  @IsObject()
  @IsNotEmpty()
  addressDetails: AddressDetailsDto;

  @ApiProperty({ description: 'Total price', example: '599.97' })
  @IsString()
  @IsNotEmpty()
  totalPrice: string;

  @ApiProperty({
    description: 'Delivery date timestamp',
    example: 1749637522271,
  })
  @IsNumber()
  deliveryDate: number;

  @ApiProperty({
    type: String,
    enum: PaymentType,
    enumName: 'PaymentType',
  })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({
    type: String,
    enum: DeliveryType,
    enumName: 'DeliveryType',
  })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiProperty({ description: 'Products to order', type: [ProductOrderDto] })
  @IsArray()
  products: ProductOrderDto[];

  @ApiProperty({ description: 'Send email confirmation', example: false })
  @IsBoolean()
  sendEmail: boolean;
}
