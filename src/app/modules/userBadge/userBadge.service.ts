import { UserBadge } from './userBadge.model';
import User from '../user/user-model';
import httpStatus from 'http-status';
import AppError from '../../error/appError';

const claimBadge = async (userId: string, badgeId: string) => {
    const userBadge = await UserBadge.findOne({
        userId,
        badgeId,
        isClaim: false
    });

    if (!userBadge) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge not found or already claimed');
    }

    userBadge.isClaim = true;
    await userBadge.save();


    return userBadge;
};

export const UserBadgeServices = {
    claimBadge
};