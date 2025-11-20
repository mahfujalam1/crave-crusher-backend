import { Model } from 'mongoose';
import { USER_ROLE } from './user-constant';

// Define the User type
export type TUser = {
  id: string;
  fullName: string;
  email: string;
  profileImage: string;
  role: 'admin' | 'user';
  password: string;
  isBlocked: boolean;
  verifyCode: string;
  resetCode: string;
  isVerified: boolean;
  isResetVerified: boolean;
  codeExpireIn: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
};

// Define the UserModel interface, which includes static methods
export interface UserModel extends Model<TUser> {
  isPasswordMatched(plainPassword: string, hashPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChange(
    passwordChangeTimeStamp: Date,
    jwtIssuedTimeStamp: number
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
