import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { Gender, UserRole, UserStatus } from 'src/enum';
import * as mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @ApiProperty({
    description: 'Username',
  })
  @Prop({ required: true, type: String, unique: true })
  userName: string;

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
    description: 'Date of Birth',
  })
  @Prop({
    type: String,
    default: new Date(),
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Role',
    enum: UserRole,
  })
  @Prop({ type: String, default: UserRole.USER, enum: UserRole })
  role: UserRole;

  @ApiProperty({
    description: 'Status',
    enum: UserStatus,
  })
  @Prop({ type: String, default: UserStatus.ACTIVE, enum: UserStatus })
  status: UserStatus;

  @ApiProperty({
    description: 'Gender',
    enum: Gender,
  })
  @Prop({ type: String, default: Gender.OTHER, enum: Gender })
  gender: Gender;

  @ApiProperty({
    description: 'Avatar',
  })
  @Prop({ type: String, default: '' })
  avatar: string;

  @ApiProperty({
    description: 'Phone Number',
  })
  @Prop({
    type: String,
    default: '',
    unique: true,
    match: /^([+]\d{2})?\d{10}$/,
  })
  phoneNumber: string;

  @ApiProperty()
  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ])
  favoriteProducts: Types.ObjectId[];

  @ApiProperty()
  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  ])
  orders: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
