import { Battle } from './battle.model';
import { IBattle, BattleStatus } from './battle.interface';
import httpStatus from 'http-status';
import { sendSinglePushNotification } from '../../helper/sendPushNotification';
import AppError from '../../error/appError';
import { BattleLog } from '../battleLog/battleLog.model';
import { BadgeProgress } from '../badgeProgress/badgeProgress.model';
import { Badge } from '../badge/badge.model';
import { UserBadge } from '../userBadge/userBadge.model';
import { BattleLogStatus } from '../battleLog/battleLog.interface';

const createBattleIntoDB = async (userId: string, payload: Partial<IBattle>) => {
    const battleData = {
        ...payload,
        userId,
        battleStatus: BattleStatus.ACTIVE,
        day: 1,
        totalCrave: 0,
        battleProgress: 0
    };

    const battle = await Battle.create(battleData);

    // Create battle logs for all days
    const battleLogs = [];
    for (let i = 1; i <= payload.battleLength!; i++) {
        battleLogs.push({
            battleId: battle._id,
            day: i,
            status: null
        });
    }
    await BattleLog.insertMany(battleLogs);

    // Check if user has badge progress, if not create first badge progress
    let badgeProgress = await BadgeProgress.findOne({ userId });
    if (!badgeProgress) {
        const firstBadge = await Badge.findOne().sort({ orderNumber: 1 });
        if (firstBadge) {
            badgeProgress = await BadgeProgress.create({
                userId,
                currentProgress: 0,
                craveCount: 0,
                currentBadgeId: firstBadge._id,
                nextBadgeId: await Badge.findOne({
                    orderNumber: { $gt: firstBadge.orderNumber }
                }).select('_id')
            });
        }
    }

    // Send notification
    await sendSinglePushNotification(
        userId,
        'Battle Created!',
        `Your ${payload.addictionType} battle has started. Stay strong!`,
        { battleId: battle._id.toString() }
    );

    return battle;
};

const updateBattleDayStatus = async (
    battleId: string,
    userId: string,
    status: BattleLogStatus
) => {
    const battle = await Battle.findOne({
        _id: battleId,
        userId,
        battleStatus: BattleStatus.ACTIVE,
        isDeleted: false
    });

    if (!battle) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle not found or not active');
    }

    const currentDay = battle.day;
    const battleLog = await BattleLog.findOne({ battleId, day: currentDay });

    if (!battleLog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle log not found');
    }

    // Update battle log status
    battleLog.status = status;
    await battleLog.save();

    // Only update progress if status is "crave"
    if (status === 'crave') {
        battle.totalCrave += 1;
        battle.battleProgress = (battle.totalCrave / battle.battleLength) * 100;

        // Update badge progress
        const badgeProgress = await BadgeProgress.findOne({ userId }).populate('currentBadgeId nextBadgeId');

        if (badgeProgress) {
            const today = new Date().toDateString();
            const lastCraveDay = badgeProgress.lastCraveDate?.toDateString();

            //  Only count once per day across all battles
            if (lastCraveDay !== today) {
                badgeProgress.craveCount += 1;
                badgeProgress.lastCraveDate = new Date();

                const currentBadge = await Badge.findById(badgeProgress.currentBadgeId);
                if (currentBadge) {
                    badgeProgress.currentProgress = (badgeProgress.craveCount / currentBadge.orderNumber) * 100;

                    // Badge unlock logic
                    if (badgeProgress.currentProgress >= 100 || badgeProgress.currentProgress === 100) {
                        // Create user badge if not already created
                        const existingUserBadge = await UserBadge.findOne({
                            userId,
                            badgeId: currentBadge._id
                        });
                        console.log('badge id ki ache???', existingUserBadge)

                        if (!existingUserBadge) {
                            const createUserBadge = await UserBadge.create({
                                userId,
                                badgeId: currentBadge._id,
                                isClaim: false
                            });
                            console.log(createUserBadge)

                            // Send push notification for badge unlock
                            await sendSinglePushNotification(
                                userId,
                                'Badge Unlocked!',
                                `Congratulations! You've unlocked the ${currentBadge.name} badge!`,
                                { badgeId: currentBadge._id.toString() }
                            );
                        }
                        console.log('badge id ki create hoiche??', existingUserBadge)

                        // Move to next badge
                        const nextBadge = await Badge.findOne({
                            orderNumber: { $gt: currentBadge.orderNumber }
                        }).sort({ orderNumber: 1 });

                        if (nextBadge) {
                            badgeProgress.currentBadgeId = nextBadge._id;

                            const nextNextBadge = await Badge.findOne({
                                orderNumber: { $gt: nextBadge.orderNumber },
                            })
                                .sort({ orderNumber: 1 })
                                .select('_id');

                            badgeProgress.nextBadgeId = nextNextBadge?._id ?? null;
                            badgeProgress.currentProgress = 0; // Reset for new badge
                        }
                    }
                }

                await badgeProgress.save();
            }
        }
    }

    // Move to next day
    if (currentDay < battle.battleLength) {
        battle.day += 1;
    } else {
        // Battle completed
        battle.battleStatus = BattleStatus.COMPLETE;
        await sendSinglePushNotification(
            userId,
            'Battle Complete!',
            `Congratulations! You've completed your ${battle.addictionType} battle!`,
            { battleId: battle._id.toString() }
        );
    }

    await battle.save();

    return battle;
};


const getUserBattles = async (userId: string) => {
    const battles = await Battle.find({
        userId,
        isDeleted: false
    }).sort({ createdAt: -1 });

    return battles;
};

const getBattleById = async (battleId: string, userId: string) => {
    const battle = await Battle.findOne({
        _id: battleId,
        userId,
        isDeleted: false
    });

    if (!battle) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle not found');
    }

    const battleLogs = await BattleLog.find({ battleId, status: { $ne: null } }).sort({ day: 1 });

    return {
        battle,
        battleLogs
    };
};

const cancelBattle = async (battleId: string, userId: string) => {
    const battle = await Battle.findOne({
        _id: battleId,
        userId,
        battleStatus: BattleStatus.ACTIVE,
        isDeleted: false
    });

    if (!battle) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle not found or already completed');
    }

    battle.battleStatus = BattleStatus.CANCEL;
    await battle.save();

    return battle;
};

export const BattleServices = {
    createBattleIntoDB,
    updateBattleDayStatus,
    getUserBattles,
    getBattleById,
    cancelBattle
};