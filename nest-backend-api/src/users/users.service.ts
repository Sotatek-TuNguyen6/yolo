import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddressService } from 'src/address/address.service';
import { IUser } from 'src/interface/user.interface';
import { ICommonObj } from 'src/interface/common.interface';
import { Address } from 'src/address/entities/address.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/enum';
import { CreateAddressDto } from 'src/address/dto/create-address.dto';

const populate = [
  {
    path: 'favoriteProducts',
    model: 'Product',
  },
  {
    path: 'orders',
    model: 'Order',
    populate: [
      {
        path: 'items.product',
        model: 'Product',
      },
      {
        path: 'items.color',
        model: 'Color', // hoặc model tương ứng
      },
      {
        path: 'items.size',
        model: 'Size', // hoặc model tương ứng
      },
    ],
  },
];

interface UserWithAddresses extends User {
  addresses: Address[] | Address | [];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly addressService: AddressService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { userName, email, phoneNumber } = createUserDto;

      const user = await this.userModel
        .findOne({
          $or: [{ userName }, { email }, { phoneNumber }],
        })
        .select('-password');

      if (user) {
        throw new BadRequestException('Người dùng đã tồn tại');
      }

      const newUser = new this.userModel({
        ...createUserDto,
      });

      const savedUser = await newUser.save();
      return savedUser.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<IUser[]> {
    const users = await this.userModel.find().select('-password').exec();

    // Lấy thêm address cho mỗi user
    const usersWithAddresses = await Promise.all(
      users.map(async (user) => {
        const addresses = await this.addressService.findById(
          user._id as string,
        );
        const userObj = user.toObject();
        return {
          ...userObj,
          addresses: addresses ? addresses : [],
        };
      }),
    );

    return usersWithAddresses as unknown as IUser[];
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      .populate(populate)
      .select('-password')
      .exec();
    if (user) {
      const addresses = await this.addressService.findByUserId(
        user._id as string,
      );
      const addressesArray = Array.isArray(addresses)
        ? addresses
        : addresses
          ? [addresses]
          : [];
      return {
        ...user.toObject(),
        addresses: addressesArray,
      } as unknown as UserWithAddresses;
    }
    return null;
  }

  async findByEmail(
    email: string,
    isSelectPassword = false,
  ): Promise<UserWithAddresses | null> {
    const query = this.userModel.findOne({ email });
    if (isSelectPassword) {
      query.select('+password');
    }
    const user = await query.exec();
    if (user) {
      const addresses = await this.addressService.findById(user._id as string);
      const addressesArray = Array.isArray(addresses)
        ? addresses
        : addresses
          ? [addresses]
          : [];

      return {
        ...user.toObject(),
        addresses: addressesArray,
      } as unknown as UserWithAddresses;
    }
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
        })
        .select('-password')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel
        .findByIdAndDelete(id)
        .select('-password')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateAny(id: string, data: ICommonObj): Promise<User | null> {
    try {
      const newUser = await this.userModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!newUser) {
        throw new NotFoundException('User not found');
      }

      return newUser.populate(populate);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    const { password, newPassword } = changePasswordDto;
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    return { message: 'Password changed successfully' };
  }

  async lockUser(id: string): Promise<User | null> {
    const user = await this.userModel.findByIdAndUpdate(id, {
      status: UserStatus.INACTIVE,
    });
    return user;
  }

  async createAddress(createAddressDto: CreateAddressDto, userId: string) {
    try {
      return this.addressService.create(createAddressDto, userId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
