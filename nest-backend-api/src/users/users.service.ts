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
import { ICommonObj } from 'src/interface/common.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/enum';
import { CounterService } from 'src/common/services/counter.service';
import { UserReportResponse } from './dto/user-report.dto';

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

// interface UserWithAddresses extends User {
//   addresses: Address[] | Address | [];
// }

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    // private readonly addressService: TypeError: Invalid schema configuration: `OrderDetail` is not a valid type within the array `orderDetails`.See https://bit.ly/mongoose-schematypes for a list of valid schema types.AddressService,
    private readonly counterService: CounterService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const userId = await this.counterService.getNextSequence('user');
      const { email } = createUserDto;

      const user = await this.userModel
        .findOne({
          $or: [{ email }],
        })
        .select('-password');

      if (user) {
        throw new BadRequestException('Người dùng đã tồn tại');
      }

      const password = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        userId,
        password,
      });

      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().select('-password').exec();

    return users;
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel
      .findById(id)
      // .populate(populate)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
    // if (user) {
    //   const addresses = await this.addressService.findByUserId(
    //     user._id as string,
    //   );
    //   const addressesArray = Array.isArray(addresses)
    //     ? addresses
    //     : addresses
    //       ? [addresses]
    //       : [];
    //   return {
    //     ...user.toObject(),
    //     addresses: addressesArray,
    //   } as unknown as UserWithAddresses;
    // }
    // return null;
  }

  async findByEmail(
    email: string,
    isSelectPassword = false,
  ): Promise<User | null> {
    const query = this.userModel.findOne({ email });
    if (isSelectPassword) {
      query.select('+password');
    }
    return query.exec();
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

  async getUserReport(): Promise<UserReportResponse> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get all users within date range
    // const users = await this.userModel
    //   .find({
    //     createdAt: { $gte: reportStartDate, $lte: reportEndDate },
    //   })
    //   .lean();

    // Count total users
    const totalUsers = await this.userModel.countDocuments();

    // Count active/inactive users
    const activeUsers = await this.userModel.countDocuments({
      status: UserStatus.ACTIVE,
    });
    const inactiveUsers = totalUsers - activeUsers;

    // Count new users this month and last month
    const newUsersThisMonth = await this.userModel.countDocuments({
      createdAt: { $gte: currentMonth, $lte: now },
    });
    const newUsersLastMonth = await this.userModel.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth },
    });

    // Calculate growth rate
    const growthRate =
      newUsersLastMonth === 0
        ? 100 // if no users last month, growth rate is 100%
        : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

    // Group users by status
    const statusStats = {};
    const statuses = Object.values(UserStatus);

    for (const status of statuses) {
      statusStats[status] = await this.userModel.countDocuments({ status });
    }

    // Group users by registration month
    const monthlyStats = {};

    // Get users for the last 12 months
    const lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

    // const usersLastYear = await this.userModel
    //   .find({
    //     createdAt: { $gte: lastYearDate },
    //   })
    //   .lean();

    // Group by month
    // usersLastYear.forEach((user: any) => {
    //   if (user && user.createdAt) {
    //     const date = new Date(user.createdAt);
    //     const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    //     if (!monthlyStats[monthKey]) {
    //       monthlyStats[monthKey] = 0;
    //     }

    //     monthlyStats[monthKey]++;
    //   }
    // });

    // Create report with users that have password set to undefined
    return {
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        growthRate: parseFloat(growthRate.toFixed(2)),
      },
      statusStats,
      monthlyStats,
      // users: users.map((user: any) => ({
      //   ...user,
      //   password: undefined,
      // })),
    };
  }

  // async createAddress(createAddressDto: CreateAddressDto, userId: string) {
  //   try {
  //     return this.addressService.create(createAddressDto, userId);
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }
}
