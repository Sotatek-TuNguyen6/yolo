import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { IAddressValue } from 'src/interface/address.interface';

export type AddressDocument = Address & mongoose.Document;
@Schema({ timestamps: true })
export class Address {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  @ApiProperty()
  user: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  fullName: string;

  @Prop({
    type: String,
    required: true,
    match: /^([+]\d{2})?\d{10}$/,
  })
  phoneNumber: string;

  @Prop({
    type: String,
    default: '',
  })
  @ApiProperty({
    default: '',
    required: false,
  })
  street: string;

  @Prop({
    type: Object,
    required: true,
  })
  @ApiProperty()
  ward: IAddressValue;

  @Prop({
    type: Object,
    required: true,
  })
  @ApiProperty()
  district: IAddressValue;

  @Prop({
    type: Object,
    required: true,
  })
  @ApiProperty()
  province: IAddressValue;

  @Prop({
    type: Boolean,
  })
  isDefault?: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
