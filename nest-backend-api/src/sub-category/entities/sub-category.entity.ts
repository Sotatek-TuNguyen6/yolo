import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Category } from '../../categories/entities/category.entity';

export type SubCategoryDocument = SubCategory & mongoose.Document;
@Schema({
  timestamps: true,
})
export class SubCategory {
  @Prop({
    type: String,
    required: true,
    lowercase: true,
  })
  @ApiProperty({
    type: String,
    required: true,
  })
  name: string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ])
  @ApiProperty({
    type: Category,
    required: true,
    isArray: true,
    default: [],
  })
  categoryParents: mongoose.Types.ObjectId[];

  @Prop({
    type: String,
  })
  @ApiProperty({
    type: String,
    default: '',
    required: false,
  })
  imageUrl?: string;

  @Prop({
    type: String,
  })
  @ApiProperty({
    type: String,
  })
  slug: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
