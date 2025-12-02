import AppError from '../../error/appError';
import { UserBadge } from '../userBadge/userBadge.model';
import { BadgeProgress } from './badgeProgress.model';
import httpStatus from 'http-status';

const getUserBadgeProgress = async (userId: string) => {
    const badgeProgress = await BadgeProgress.findOne({ userId })
        .populate('currentBadgeId')
        .populate('nextBadgeId');

    if (!badgeProgress) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge progress not found');
    }

    return badgeProgress;
};

const getUserUnlockedBadges = async (userId: string) => {
    const unlockedBadges = await UserBadge.find({ userId })
        .populate('badgeId')
        .sort({ createdAt: -1 });

    return unlockedBadges;
};

export const BadgeProgressServices = {
    getUserBadgeProgress,
    getUserUnlockedBadges
};