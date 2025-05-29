import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Category extends Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  @ApiProperty()
  name: string;

  @Prop({
    type: String,
    default: 'Một sản phẩm đến từ Athetics Store',
  })
  @ApiProperty({
    required: false,
    default: 'Một sản phẩm đến từ Athetics Store',
  })
  description: string;

  @Prop({
    type: String,
    required: true,
  })
  @ApiProperty()
  imageUrl: string;

  @Prop({
    type: String,
  })
  @ApiProperty()
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
