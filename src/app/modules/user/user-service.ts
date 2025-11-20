import httpStatus from "http-status";
import { TUser } from "./user-interface";
import AppError from "../../error/appError";
import User from "./user-model";

const createUserIntoDB = async (payload: TUser) => {

  const emailExist = await User.findOne({ email: payload.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  
  const user = await User.create(payload);
  return user;
};



export const UserServices = {
  createUserIntoDB,
};
