import httpStatus from "http-status";
import { TUser, TUserRole } from "./user-interface";
import AppError from "../../error/appError";
import User from "./user-model";
import sendEmail from "../../utils/sendEmail";
import registrationSuccessEmailBody from "../../mailTemplate/registerSucessEmail";
import { USER_ROLE } from "./user-constant";
import { JwtPayload } from "jsonwebtoken";
import { createToken } from "./user.utils";
import config from "../../config";

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

const createUserIntoDB = async (payload: TUser) => {

  const emailExist = await User.findOne({ email: payload.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exists');
  }

  try {
    const verifyCode = generateVerifyCode();

    const userDataPayload: Partial<TUser> = {
      email: payload.email,
      fullName: payload.fullName,
      password: payload.password,
      role: payload.role,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };


    sendEmail({
      email: payload.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(payload.fullName, verifyCode),
    });

    const user = await User.create(userDataPayload);


    return user;

  } catch (error) {
    throw error;
  }
};


const verifyCode = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }
  const result = await User.findOneAndUpdate(
    { email: email },
    { isVerified: true },
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Server temporary unable please try again letter'
    );
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
    accessToken,
    refreshToken,
  };
};

const resendVerifyCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { email: email },
    {
      verifyCode: verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    },
    { new: true, runValidators: true }
  );
  if (!updateUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong . Please again resend the code after a few second'
    );
  }
  sendEmail({
    email: user.email,
    subject: 'Activate Your Account',
    html: registrationSuccessEmailBody('Dear', updateUser.verifyCode),
  });
  return null;
};

const getMyProfile = async (userData: JwtPayload) => {
  const result = await User.findOne({ email: userData.email }).select('-password');

  return result;
};

// const updateProfile = async (userData: JwtPayload, payload: any) => {
//   if (userData.role === USER_ROLE.user) {
//     const user = await NormalUser.findById(userData.profileId);
//     if (!user) {
//       throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//     }

//     // If profile image exists and a new one is uploaded — delete the old one
//     if (user.profile_image && payload.profile_image) {
//       await deleteFileFromS3(user.profile_image);
//     }

//     const result = await NormalUser.findByIdAndUpdate(
//       userData.profileId,
//       payload,
//       { new: true, runValidators: true }
//     );

//     return result;
//   }

//   // Organizer Profile Update
//   else if (userData.role === USER_ROLE.organizer) {
//     const organizer = await Organizer.findById(userData.profileId);
//     if (!organizer) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Organizer not found');
//     }

//     if (organizer.profile_image && payload.profile_image) {
//       await deleteFileFromS3(organizer.profile_image);
//     }

//     const result = await Organizer.findByIdAndUpdate(
//       userData.profileId,
//       payload,
//       { new: true, runValidators: true }
//     );

//     return result;
//   }

//   // Super Admin Profile Update
//   else if (userData.role === USER_ROLE.admin) {
//     const superAdmin = await SuperAdmin.findById(userData.profileId);
//     if (!superAdmin) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Super Admin not found');
//     }

//     if (superAdmin.profile_image && payload.profile_image) {
//       await deleteFileFromS3(superAdmin.profile_image);
//     }

//     const result = await SuperAdmin.findByIdAndUpdate(
//       userData.profileId,
//       payload,
//       { new: true, runValidators: true }
//     );

//     return result;
//   }

//   // Invalid role
//   else {
//     throw new AppError(httpStatus.FORBIDDEN, 'Invalid user role');
//   }
// };

export const UserServices = {
  createUserIntoDB,
  getMyProfile,
  resendVerifyCode,
  verifyCode,
};
