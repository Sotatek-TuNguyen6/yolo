import { IsInt, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
// import { IItemCart } from 'src/interface/cart.interface';
import { CartItem } from '../entities/cart.entity';

export class ItemCartDto {
  @IsNotEmpty({
    message: 'Missing product',
  })
  @IsString({
    message: 'Product must be string',
  })
  @ApiProperty()
  product: string;

  @IsNotEmpty({
    message: 'Missing quantities',
  })
  @IsInt({
    message: 'Quantities must be a number',
  })
  @Min(1, {
    message: 'At least 1 quantities',
  })
  @ApiProperty()
  quantities: number;

  @IsNotEmpty({
    message: 'Missing color',
  })
  @IsString({
    message: 'Color must be a string',
  })
  @ApiProperty()
  color: string;

  @IsNotEmpty({
    message: 'Missing size',
  })
  @IsString({
    message: 'Size must be a string',
  })
  @ApiProperty()
  size: string;
}

export class CreateItemCartDto {
  @IsString({
    message: 'User id must be string',
  })
  @ApiProperty()
  user: Types.ObjectId;

  @IsNotEmpty({
    message: 'Missing item',
  })
  item: CartItem;
}
