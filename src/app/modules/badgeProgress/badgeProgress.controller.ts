import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { BadgeProgressServices } from './badgeProgress.service';

const getUserBadgeProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await BadgeProgressServices.getUserBadgeProgress(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badge progress retrieved successfully',
        data: result
    });
});

const getUserUnlockedBadges = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await BadgeProgressServices.getUserUnlockedBadges(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Unlocked badges retrieved successfully',
        data: result
    });
});

export const BadgeProgressControllers = {
    getUserBadgeProgress,
    getUserUnlockedBadges
};