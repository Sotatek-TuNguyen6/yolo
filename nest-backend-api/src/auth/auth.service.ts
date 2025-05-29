import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtPayloadResetPassword } from 'src/types';
import { ResetPasswordDto } from './dto/reset-auth.dto';
import { UserStatus } from 'src/enum';
import { User } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { TokenBlacklist } from './schema/token-blacklist.schema';
import { Model } from 'mongoose';

// Định nghĩa interface cho token payload
interface TokenPayload {
  exp: number;
  sub: string;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(TokenBlacklist.name)
    private tokenBlacklistModel: Model<TokenBlacklist>,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  verifyToken(token: string, secret: string): JwtPayloadResetPassword {
    return this.jwtService.verify<JwtPayloadResetPassword>(token, {
      secret,
    });
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { password, address } = createUserDto;
    const hashedPassword = await this.hashPassword(password);

    // Xóa địa chỉ từ createUserDto để tạo user trước
    const userDataToCreate = {
      ...createUserDto,
      password: hashedPassword,
    };
    delete userDataToCreate.address;

    // Tạo người dùng
    const user = await this.usersService.create(userDataToCreate);

    // Nếu có địa chỉ, tạo địa chỉ cho người dùng
    if (address && user) {
      // Tự động đặt là địa chỉ mặc định nếu không có giá trị
      if (address.isDefault === undefined) {
        address.isDefault = true;
      }

      // Tự động sử dụng tên và số điện thoại từ thông tin đăng ký nếu không cung cấp
      if (!address.fullName) {
        address.fullName = createUserDto.fullName;
      }

      if (!address.phoneNumber) {
        address.phoneNumber = createUserDto.phoneNumber;
      }

      await this.usersService.createAddress(address, user._id as string);
    }

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; user: Partial<User> }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const token = this.jwtService.sign({
      sub: user._id,
      role: user.role,
      email: user.email,
      gender: user.gender,
    });

    const userNotPassword = await this.usersService.findOne(user._id as string);

    if (!userNotPassword) {
      throw new UnauthorizedException('User not found');
    }

    return { token, user: userNotPassword };
  }

  async logout(token: string, userId: string): Promise<boolean> {
    try {
      // Giải mã token để lấy thông tin hết hạn
      const decodedToken: unknown = this.jwtService.decode(token);
      if (
        !decodedToken ||
        typeof decodedToken !== 'object' ||
        !('exp' in decodedToken)
      ) {
        throw new UnauthorizedException('Invalid token');
      }

      // Tạo đối tượng expiresAt từ timestamp trong token
      const payload = decodedToken as TokenPayload;
      const expiresAt = new Date(payload.exp * 1000);

      // Kiểm tra xem token đã có trong blacklist chưa
      const existingToken = await this.tokenBlacklistModel.findOne({ token });
      if (existingToken) {
        return true; // Token đã bị vô hiệu hóa trước đó
      }

      // Thêm token vào blacklist
      await this.tokenBlacklistModel.create({
        token,
        userId,
        expiresAt,
      });

      return true;
    } catch (error) {
      console.error('Error invalidating token:', error);
      return false;
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistModel.findOne({ token });
    return !!blacklistedToken;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ token: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    const createToken = this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
      },
      { expiresIn: this.configService.get('JWT_EXPIRE_TEN_MINUTES') },
    );

    return { token: createToken };
  }

  async resetPassword(
    payload: JwtPayloadResetPassword,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { sub, email } = payload;
    const { newPassword } = resetPasswordDto;

    const user = await this.usersService.findOne(sub);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (user.email !== email) {
      throw new UnauthorizedException('Email không chính xác');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
  }
}
