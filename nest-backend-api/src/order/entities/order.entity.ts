import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import {
  DeliveryType,
  OrderStatus,
  PaymentStatus,
  PaymentType,
} from 'src/enum';
export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class OrderDetail {
  @Prop({ required: true, type: Number, unique: true })
  orderDetailId: number;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  })
  product: Types.ObjectId;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: false, type: String })
  imageId?: string;

  @Prop({ required: false, type: String })
  size?: string;

  @Prop({ required: false, type: String })
  productName?: string;

  @Prop({ required: false, type: Number })
  discountPercent?: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);

@Schema({ timestamps: true })
export class CustomerInfo {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  phone: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Number, unique: true })
  orderId: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  user?: Types.ObjectId;

  @Prop({
    type: CustomerInfo,
    required: true,
  })
  customerInfo: CustomerInfo;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  shippingAddress: string;

  @Prop({
    type: String,
    // required: true,
    trim: true,
  })
  township: string;

  @Prop({
    type: String,
    // required: true,
    trim: true,
  })
  city: string;

  @Prop({
    type: String,
    // required: true,
    trim: true,
  })
  state: string;

  @Prop({
    type: String,
    // required: true,
    trim: true,
  })
  zipCode: string;

  @Prop({
    type: Date,
    default: new Date(),
  })
  orderDate: Date;

  @Prop({
    type: String,
    enum: PaymentType,
    default: PaymentType.CASH_ON_DELIVERY,
  })
  paymentType: PaymentType;

  @Prop({
    type: String,
    enum: DeliveryType,
    default: DeliveryType.STORE_PICKUP,
  })
  deliveryType: DeliveryType;

  @Prop({
    type: Number,
  })
  totalPrice: number;

  @Prop({
    type: Number,
  })
  deliveryDate: number;

  @Prop({
    type: [OrderDetailSchema],
    required: true,
  })
  orderDetails: OrderDetail[];

  @Prop({
    type: Number,
  })
  totalQuantity: number;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
