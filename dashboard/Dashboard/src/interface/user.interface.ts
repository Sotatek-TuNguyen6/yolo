// Định nghĩa các kiểu dữ liệu
export type UserRole = 'admin' | 'user' | 'manager';
export type UserStatus = 'active' | 'inactive' | 'banned';
export type UserGender = 'male' | 'female' | 'other';

// Interface cho User
export interface User {
  _id?: string;
  userName: string;
  email: string;
  fullName: string;
  dateOfBirth?: string | Date;
  role: UserRole;
  status: UserStatus;
  gender: UserGender;
  avatar?: string;
  phoneNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  favoriteProducts?: string[];
  orders?: string[];
}

// Interface cho đăng nhập
export interface UserLogin {
  email: string;
  password: string;
}

// Interface cho đăng ký
export interface UserRegister {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

// Interface cho cập nhật thông tin
export interface UserUpdate {
  userName?: string;
  fullName?: string;
  dateOfBirth?: string | Date;
  gender?: UserGender;
  avatar?: string;
  phoneNumber?: string;
}

// Interface cho đổi mật khẩu
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
