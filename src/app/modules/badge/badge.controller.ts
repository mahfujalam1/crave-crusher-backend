import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { BadgeServices } from './badge.service';

const createBadge = catchAsync(async (req: Request, res: Response) => {
    const { files } = req;
    const badgeNumber = (req.body.orderNumber) ? parseInt(req.body.orderNumber, 10) : undefined;
    const name = req.body.name;
    let imageUrl;
    if (files && !Array.isArray(files) && files.badge_image && files.badge_image[0]) {
        imageUrl = files.badge_image[0].path;
    }
    const bodyData = { name, orderNumber: badgeNumber, badge_image: imageUrl };
    const result = await BadgeServices.createBadgeIntoDB(bodyData);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Badge created successfully',
        data: result
    });
});

const getAllBadges = catchAsync(async (req: Request, res: Response) => {
    const result = await BadgeServices.getAllBadges();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badges retrieved successfully',
        data: result
    });
});

const getBadgeById = catchAsync(async (req: Request, res: Response) => {
    const { badgeId } = req.params;
    const result = await BadgeServices.getBadgeById(badgeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badge retrieved successfully',
        data: result
    });
});

const updateBadge = catchAsync(async (req: Request, res: Response) => {
    const { badgeId } = req.params;
    const result = await BadgeServices.updateBadgeIntoDB(badgeId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badge updated successfully',
        data: result
    });
});

const deleteBadge = catchAsync(async (req: Request, res: Response) => {
    const { badgeId } = req.params;
    const result = await BadgeServices.deleteBadgeFromDB(badgeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Badge deleted successfully',
        data: result
    });
});

export const BadgeControllers = {
    createBadge,
    getAllBadges,
    getBadgeById,
    updateBadge,
    deleteBadge
};