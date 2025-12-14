import { UserBadge } from './userBadge.model';
import User from '../user/user-model';
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ObjectId } from 'mongodb';
import { Badge } from '../badge/badge.model';

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


const gainedBadges = async (userId: string) => {
    const userBadges = await UserBadge.find({
        userId,
        isClaim: false
    });

    if (!userBadges || userBadges.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'Badge not found or already claimed');
    }

    // Extract all badge IDs
    const badgeIds = userBadges.map(userBadge => userBadge.badgeId);

    // Fetch all badges in a single query
    const badges = await Badge.find({
        _id: { $in: badgeIds }
    });

    return badges;
};


const claimedBadges = async (userId: string) => {
    const userBadges = await UserBadge.find({
        userId,
        isClaim: true
    });

    if (!userBadges || userBadges.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'claim Badge not found');
    }

    // Extract all badge IDs
    const badgeIds = userBadges.map(userBadge => userBadge.badgeId);

    // Fetch all badges in a single query
    const badges = await Badge.find({
        _id: { $in: badgeIds }
    });

    return badges;
};

export const UserBadgeServices = {
    claimBadge,
    gainedBadges,
    claimedBadges
};