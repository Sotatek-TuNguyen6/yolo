import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  product: Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  commentRoot?: Types.ObjectId;
}
