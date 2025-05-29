import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { IAddressValue } from 'src/interface/address.interface';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  ward: IAddressValue;

  @IsNotEmpty()
  @IsString()
  district: IAddressValue;

  @IsNotEmpty()
  @IsString()
  province: IAddressValue;

  @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;
}
