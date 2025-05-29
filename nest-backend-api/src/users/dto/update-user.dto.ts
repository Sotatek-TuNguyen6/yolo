import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Loại bỏ trường role khỏi DTO để tránh người dùng tự nâng quyền
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [] as const),
) {
  // Role không được phép cập nhật qua API này
  role?: never;
}
