import { Badge } from './badge.model';
import { IBadge } from './badge.interface';
import httpStatus from 'http-status';
import AppError from '../../error/appError';

const createBadgeIntoDB = async (payload: Partial<IBadge>) => {
    const badge = await Badge.create(payload);
    return badge;
};

const getAllBadges = async () => {
    const badges = await Badge.find({ isDeleted: false }).sort({ orderNumber: 1 });
    return badges;
};

const getBadgeById = async (badgeId: string) => {
    const badge = await Badge.findOne({ _id: badgeId, isDeleted: false });
    if (!badge) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
    }
    return badge;
};

const updateBadgeIntoDB = async (badgeId: string, payload: Partial<IBadge>) => {
    const badge = await Badge.findOneAndUpdate(
        { _id: badgeId, isDeleted: false },
        payload,
        { new: true }
    );

    if (!badge) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
    }

    return badge;
};

const deleteBadgeFromDB = async (badgeId: string) => {
    const badge = await Badge.findByIdAndUpdate(
        badgeId,
        { isDeleted: true },
        { new: true }
    );

    if (!badge) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
    }

    return badge;
};

export const BadgeServices = {
    createBadgeIntoDB,
    getAllBadges,
    getBadgeById,
    updateBadgeIntoDB,
    deleteBadgeFromDB
};