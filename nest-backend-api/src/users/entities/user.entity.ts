import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/enum';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true, type: Number, unique: true })
  userId: number;

  @ApiProperty({
    description: 'Email',
  })
  @Prop({
    required: true,
    type: String,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  email: string;

  @ApiProperty({
    description: 'Password',
  })
  @Prop({ required: true, type: String, select: false })
  password: string;

  @ApiProperty({
    description: 'Full Name',
  })
  @Prop({ required: true, type: String })
  fullName: string;

  @ApiProperty({
    description: 'ShippingAddress',
  })
  @Prop({ required: false, type: String })
  shippingAddress: string;

  @ApiProperty({
    description: 'Role',
    enum: UserRole,
  })
  @Prop({ type: String, default: UserRole.USER, enum: UserRole })
  role: UserRole;

  @ApiProperty({
    description: 'Status',
  })
  @Prop({ type: Boolean, default: true })
  active: boolean;

  @ApiProperty({
    description: 'Phone Number',
  })
  @Prop({
    type: String,
    default: '',
    unique: true,
    match: /^([+]\d{2})?\d{10}$/,
  })
  phone: string;

  @ApiProperty()
  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ])
  orders: Types.ObjectId[];

  @ApiProperty()
  @Prop({ type: String, default: '' })
  resetPwdToken: string;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  resetPwdTokenExpired: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
