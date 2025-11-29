/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserServices } from "./user-service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

export const createUser = catchAsync(async (req, res, next) => {
  const userData = req.body;

  const result = await UserServices.createUserIntoDB(userData);

  if (!result) {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "No Data Found",
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});


const verifyCode = catchAsync(async (req, res) => {
  const result = await UserServices.verifyCode(
    req?.body?.email,
    req?.body?.verifyCode
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully verified your account with email',
    data: result,
  });
});



const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await UserServices.resendVerifyCode(req?.body?.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verify code send to your email inbox',
    data: result,
  });
});


const getMyProfile = catchAsync(async (req, res) => {
  const result = await UserServices.getMyProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully retrieved your data',
    data: result,
  });
});



const updateProfile = catchAsync(async (req, res) => {
  const {files} = req;
  const {fullName} = req.body;
  let imageUrl;
  if (files && !Array.isArray(files) && files.profileImage && files.profileImage[0]) {
    imageUrl = files.profileImage[0].path;
  }
  const token = req.user;
  const result = await UserServices.updateProfile(token?.id, imageUrl, fullName);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully update your profile',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  verifyCode,
  resendVerifyCode,
  getMyProfile,
  updateProfile
};
