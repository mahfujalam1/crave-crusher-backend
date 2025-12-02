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

export const UserBadgeControllers = {
    claimBadge
};