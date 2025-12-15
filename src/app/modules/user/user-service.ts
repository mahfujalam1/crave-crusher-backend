import httpStatus from "http-status";
import { IOtherData, TUser, TUserRole } from "./user-interface";
import AppError from "../../error/appError";
import User from "./user-model";
import sendEmail from "../../utils/sendEmail";
import registrationSuccessEmailBody from "../../mailTemplate/registerSucessEmail";
import { JwtPayload } from "jsonwebtoken";
import { createToken } from "./user.utils";
import config from "../../config";
import { PostServices } from "../community/post.service";
import { Battle } from "../battle/battle.model";
import { Post } from "../community/post.model";
import { UserBadge } from "../userBadge/userBadge.model";
import QueryBuilder from "../../builder/QueryBuilder";

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

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};


const updateProfile = async (id: string, imageUrl: string | undefined, fullName: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.fullName = fullName;
  if (imageUrl) {
    user.profileImage = imageUrl;
  }

  await user.save();

  return user;
};


const blockUser = async (userId: string) => {
  const user = await User.find({ _id: userId, isDeleted: false })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!")
  }
  const result = await User.findByIdAndUpdate(userId, { isBlocked: true }, {
    runValidators: true,
  });
  return result;
}


const getSingleUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const battle = (await Battle.find({ userId: id, isDeleted: false, battleStatus: 'active' })).length
  const post = (await Post.find({ authorId: id, isDeleted: false })).length
  const earnBadge = (await UserBadge.find({ userId: id })).length
  const other = {
    activeBattle: battle,
    earnBadge,
    communityPost: post,
  }
  return { user, other };
};


const getAllUser = async (query: Record<string, unknown>) => {
  const normalUserQuery = new QueryBuilder(
    User.find(),
    query,
  )
    .search(['fullName'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const meta = await normalUserQuery.countTotal();
  const users = await normalUserQuery.modelQuery;

  const result = await Promise.all(
    users.map(async (user: TUser) => {
      const battle = await Battle.find({ userId: user._id, isDeleted: false, }).countDocuments();
      const post = await Post.find({ authorId: user._id, isDeleted: false }).countDocuments();
      const earnBadge = await UserBadge.find({ userId: user._id }).countDocuments();

      const other: IOtherData = {
        activeBattle: battle,
        earnBadge,
        communityPost: post,
      };

      return { user, other };
    })
  );

  return {
    meta,
    result,
  };
};


export const UserServices = {
  createUserIntoDB,
  getMyProfile,
  resendVerifyCode,
  verifyCode,
  updateProfile,
  blockUser,
  getSingleUser,
  getAllUser
};
