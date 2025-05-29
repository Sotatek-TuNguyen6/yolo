import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Headers,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-auth.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { RequestUser } from 'src/interface/common.interface';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/decorator/roles.guard';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly emailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('signup')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const token = await this.authService.forgotPassword(forgotPasswordDto);
    const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token.token}`;
    const text = 'Reset Password';

    const html = `<div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to News Technology UTC2.</h2>
            <p>Congratulations! You're almost set to start using News Web.
                Just click the button below to validate your email address.
            </p>
            
            <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${text}</a>
        
            <p>If the button doesn't work for any reason, you can also click on the link below:</p>
        
            <div>${url}</div>
            </div>`;
    const result = await this.emailService.sendMail(
      forgotPasswordDto.email,
      'Reset Password',
      html,
    );
    if (result) {
      return { message: 'Email đã được gửi đến email của bạn' };
    }
    return { message: 'Email không được gửi đến email của bạn' };
  }

  @Post('reset-password')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers() headers: Record<string, string>,
  ) {
    const authorization = headers['authorization'];
    if (!authorization) {
      throw new NotFoundException('Not found token');
    }

    const token = authorization.split(' ')[1];
    const decode = this.authService.verifyToken(
      token,
      this.configService.get<string>('JWT_SECRET') || 'secret123',
    );
    if (!decode) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    return this.authService.resetPassword(decode, resetPasswordDto);
  }

  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: RequestUser,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    const result = await this.usersService.changePassword(
      changePasswordDto,
      req.user.sub.toString(),
    );

    return result;
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestUser,
    @Headers() headers: Record<string, string>,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    const authorization = headers['authorization'];
    if (!authorization) {
      throw new NotFoundException('Not found token');
    }

    const token = authorization.split(' ')[1];
    const userId = req.user.sub.toString();

    // Thêm token vào blacklist
    const success = await this.authService.logout(token, userId);

    if (success) {
      return { message: 'Đăng xuất thành công' };
    } else {
      throw new UnauthorizedException('Không thể đăng xuất, vui lòng thử lại');
    }
  }
}
