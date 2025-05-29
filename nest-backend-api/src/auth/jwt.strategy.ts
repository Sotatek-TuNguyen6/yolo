import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/interface/common.interface';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret123',
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload) {
    // Lấy token từ header request
    const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();
    const token = extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // Kiểm tra xem token có trong blacklist không
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token đã bị vô hiệu hóa');
    }

    return {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
      gender: payload.gender,
    };
  }
}
