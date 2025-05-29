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
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IAddress } from 'src/interface/address.interface';
import { IItemCart } from 'src/interface/cart.interface';
import { PaymentMethodOrder, StatusOrder } from 'src/enum';

class ItemCartDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantities: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  address: IAddress;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^([+]\d{2})?\d{10}$/, {
    message: 'Phone number must be a valid 10-digit number',
  })
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  noteAddress?: string;

  @ApiProperty({ enum: StatusOrder, default: StatusOrder.PENDING })
  @IsEnum(StatusOrder)
  @IsOptional()
  status?: StatusOrder;

  @ApiProperty({ enum: PaymentMethodOrder, default: PaymentMethodOrder.CASH })
  @IsEnum(PaymentMethodOrder)
  @IsOptional()
  paymentMethod?: PaymentMethodOrder;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPayment?: boolean;

  @ApiProperty({ type: [ItemCartDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCartDto)
  items: IItemCart[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shippingFee: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total: number;
}
