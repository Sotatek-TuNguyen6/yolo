import { UserRole } from 'src/enum';

declare global {
  namespace Express {
    interface User {
      _id: string;
      role: UserRole;
    }
  }
}
