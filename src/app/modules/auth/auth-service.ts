
import config from "../../config";
import bcrypt from 'bcrypt';
import sendEmail from "../../utils/sendEmail";
import resetPasswordEmailBody from "../../mailTemplate/resetPasswordEmailBody";
import User from "../user/user-model";
import AppError from "../../error/appError";
import httpStatus from "http-status";
import { TUserRole } from "../user/user-interface";
import { createToken } from "../user/user.utils";
import { TLogin } from "./auth-interface";
import { JwtPayload } from "jsonwebtoken";

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

const logInUserIntoDB = async (payload: TLogin) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

 
  // checking if the password is correct ----
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }

  const jwtPayload = {
    id: String(user!._id),
    email: user!.email,
    role: user!.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_screet as string,
    config.jwt_access_expires_in
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_access_screet as string,
    config.jwt_access_expires_in
  );


  return {
    id:user?._id,
    accessToken,
    refreshToken,
  };
};


const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }
) => {
  if (payload.newPassword !== payload.confirmNewPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match"
    );
  }
  const user = await User.findById(userData.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  await User.findOneAndUpdate(
    {
      _id: userData.id,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );
  return null;
};


// forgot password
const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const resetCode = generateVerifyCode();
  await User.findOneAndUpdate(
    { email: email },
    {
      resetCode: resetCode,
      isResetVerified: false,
      codeExpireIn: new Date(Date.now() + 15 * 60000),
    }
  );

  sendEmail({
    email: user.email,
    subject: 'Reset password code',
    html: resetPasswordEmailBody('Dear', resetCode),
  });

  return null;
};


const verifyResetOtp = async (email: string, resetCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is expire');
  }
  if (user.resetCode !== Number(resetCode)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reset code is invalid');
  }
  await User.findOneAndUpdate(
    { email: email },
    { isResetVerified: true },
    { new: true, runValidators: true }
  );
  return null;
};

// reset password
const resetPassword = async (payload: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  if (payload.password !== payload.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match"
    );
  }
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (!user.isResetVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You need to verify reset code before reset password'
    );
  }

  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  // update the new password
  await User.findOneAndUpdate(
    {
      email: payload.email,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );
  const jwtPayload = {
    id: String(user!._id),
    email: user!.email,
    role: user!.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_screet as string,
    config.jwt_access_expires_in
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_access_screet as string,
    config.jwt_access_expires_in
  );

  return { accessToken, refreshToken };
};

const resendResetCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const resetCode = generateVerifyCode();
  await User.findOneAndUpdate(
    { email: email },
    {
      resetCode: resetCode,
      isResetVerified: false,
      codeExpireIn: new Date(Date.now() + 15 * 60000),
    }
  );
  sendEmail({
    email: user.email,
    subject: 'Reset password code',
    html: resetPasswordEmailBody('Dear', resetCode),
  });

  return null;
};


const resendVerifyCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
  }
  if (user.isDeleted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This user is already deleted'
    );
  }
  if (user.isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
  }

  const verifyCode = generateVerifyCode();
  await User.findOneAndUpdate(
    { email: email },
    {
      verifyCode: verifyCode,
      isVerified: false,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    }
  );
  sendEmail({
    email: user.email,
    subject: 'Reset password code',
    html: resetPasswordEmailBody('Dear', verifyCode),
  });

  return null;
};

export const AuthServices = {
  logInUserIntoDB,
  forgetPassword,
  resendResetCode,
  resendVerifyCode,
  resetPassword,
  verifyResetOtp,
  changePasswordIntoDB,
};
