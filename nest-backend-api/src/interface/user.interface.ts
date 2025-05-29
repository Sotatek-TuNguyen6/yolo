import { Gender, UserRole, UserStatus } from 'src/enum';

export interface IUser {
  _id: string;
  userName: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: Date;
  role: UserRole;
  status: UserStatus;
  gender: Gender;
  avatar?: string;
  phoneNumber?: string;
}
