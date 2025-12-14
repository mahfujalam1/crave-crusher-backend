import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { UserBadgeServices } from './userBadge.service';

const claimBadge = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { badgeId } = req.params;

    const result = await UserBadgeServices.claimBadge(userId, badgeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badge claimed successfully',
        data: result
    });
});


const gainedBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result = await UserBadgeServices.gainedBadges(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Gained badges retrieved successfully',
        data: result
    });
});


const claimedBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result = await UserBadgeServices.claimedBadges(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Claimed badges retrieved successfully',
        data: result
    });
});

export const UserBadgeControllers = {
    claimBadge,
    gainedBadges,
    claimedBadges
};