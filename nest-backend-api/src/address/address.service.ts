import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { Address, AddressDocument } from './entities/address.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAddress } from 'src/interface/address.interface';
@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<Address>,
  ) {}

  async defaultAddress(userId: string) {
    await this.addressModel.updateMany(
      {
        user: userId,
      },
      {
        isDefault: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  async checkAllDefault(userId: string) {
    try {
      const addresses = await this.addressModel.find({
        user: userId,
      });
      const hasDefaultAddress = addresses.find((a) => a.isDefault);
      if (!hasDefaultAddress) {
        addresses[0].isDefault = true;
        await this.addressModel.findByIdAndUpdate(
          addresses[0]._id,
          {
            $set: {
              ...addresses[0],
            },
          },
          {
            new: true,
            runValidators: true,
          },
        );
      }
      return addresses;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    try {
      if (createAddressDto.isDefault) {
        await this.defaultAddress(userId);
      }
      const address = new this.addressModel({
        ...createAddressDto,
        user: userId,
      });
      await address.save();
      return address;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateByUserId(userId: string, data: Partial<IAddress>) {
    try {
      if (data.isDefault) {
        await this.defaultAddress(userId);
      }

      const newAddress = await this.addressModel.findOneAndUpdate(
        { user: userId, _id: data._id },
        data,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!newAddress) {
        throw new NotFoundException('Không tìm address này để cập nhật');
      }

      return newAddress;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteByUserId(userId: string, addressId: string) {
    try {
      const address = await this.addressModel.findOneAndDelete({
        user: userId,
        _id: addressId,
      });
      if (!address) {
        throw new NotFoundException('Không tìm thấy address này để xóa');
      }
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findById(id: string): Promise<AddressDocument | null> {
    const address = await this.addressModel.findById(id);
    if (!address) {
      return null;
    }
    return address;
  }

  async findByUserId(userId: string): Promise<AddressDocument[] | null> {
    const address = await this.addressModel.find({ user: userId });
    if (!address) {
      return null;
    }
    return address;
  }
  // findAll() {
  //   return `This action returns all address`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} address`;
  // }

  // update(id: number, updateAddressDto: UpdateAddressDto) {
  //   return `This action updates a #${id} address`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} address`;
  // }
}
