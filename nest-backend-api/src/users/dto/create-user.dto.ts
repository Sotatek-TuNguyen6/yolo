import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  shippingAddress: string;
}
