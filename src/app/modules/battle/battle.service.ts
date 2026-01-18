import { Battle } from './battle.model';
import { IBattle, BattleStatus, } from './battle.interface';
import httpStatus from 'http-status';
import { sendSinglePushNotification } from '../../helper/sendPushNotification';
import AppError from '../../error/appError';
import { BattleLog } from '../battleLog/battleLog.model';
import { BadgeProgress } from '../badgeProgress/badgeProgress.model';
import { Badge } from '../badge/badge.model';
import { UserBadge } from '../userBadge/userBadge.model';
import { BattleLogStatus } from '../battleLog/battleLog.interface';
import { Types } from 'mongoose';
import { Monster } from '../monster/monster.model';
import Notification from '../notification/notification.model';
import { monster_messages } from '../../constant/monster_messages';

const utcDateKey = (d: Date) => d.toISOString().slice(0, 10);

const createBattleIntoDB = async (userId: string, payload: Partial<IBattle>) => {
    const battleData = {
        ...payload,
        userId,
        battleStatus: BattleStatus.ACTIVE,
        day: 1,
        totalCrave: 0,
        battleProgress: 0
    };
    try {
        const battle = await Battle.create(battleData)
        const battleLogs = [];
        for (let i = 1; i <= payload.battleLength!; i++) {
            battleLogs.push({
                battleId: battle._id,
                day: i,
                status: null
            });
        }
        await BattleLog.insertMany(battleLogs);

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
        const notificationData = {
            title: 'Battle Created!',
            message: `Your ${payload.addictionType} battle has started. Stay strong!`,
            receiver: userId,
        };
        await Notification.create(notificationData)

        return battle;
    } catch (err: any) {
        console.log(err)
    }
};

const updateBattleDayStatus = async (
    battleId: string,
    userId: string,
    status: BattleLogStatus
) => {
    const battle = await Battle.findOne({
        _id: new Types.ObjectId(battleId),
        userId: new Types.ObjectId(userId),
        battleStatus: BattleStatus.ACTIVE,
        isDeleted: false
    });

    if (!battle) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle not found or not active');
    }

    const now = new Date();

    // Log the battle's last check-in date and today's date
    console.log('Last Check-In Date:', battle.lastCheckInAt);
    console.log('Today\'s Date:', now);

    // Enforce: one check-in per day (no test mode bypass anymore)
    if (battle.lastCheckInAt && utcDateKey(battle.lastCheckInAt) === utcDateKey(now)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'You already checked in today');
    }

    const currentDay = battle.day;
    const battleLog = await BattleLog.findOne({ battleId, day: currentDay });

    if (!battleLog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle log not found');
    }

    // Update battle log status
    battleLog.status = status;
    await battleLog.save();

    // ✅ Only update badge progress and last check-in if status is updated successfully
    let badgeProgressUpdated = false;

    // Only update progress if status is "crave"
    if (status === BattleLogStatus.CRAVED) {
        battle.lastCheckInAt = now;
        battle.lastCheckInStatus = 'craved';
        battle.totalCrave += 1;
        battle.battleProgress = Math.round((battle.totalCrave / battle.battleLength) * 100);

        const badgeProgress = await BadgeProgress.findOne({ userId }).populate('currentBadgeId nextBadgeId');

        if (badgeProgress) {
            const today = new Date().toDateString();
            const lastCraveDay = badgeProgress.lastCraveDate?.toDateString();

            if (lastCraveDay !== today) {
                badgeProgress.craveCount += 1;
                badgeProgress.lastCraveDate = new Date();

                const currentBadge = await Badge.findById(badgeProgress.currentBadgeId);
                if (currentBadge) {
                    badgeProgress.currentProgress = Math.round((badgeProgress.craveCount / currentBadge.orderNumber) * 100);

                    // Badge unlock logic
                    if (badgeProgress.currentProgress >= 100) {
                        const existingUserBadge = await UserBadge.findOne({
                            userId,
                            badgeId: currentBadge._id
                        });

                        if (!existingUserBadge) {
                            const createUserBadge = await UserBadge.create({
                                userId,
                                badgeId: currentBadge._id,
                                isClaim: false
                            });

                            await sendSinglePushNotification(
                                userId,
                                'Badge Unlocked!',
                                `Congratulations! You've unlocked the ${currentBadge.name} badge!`,
                                { badgeId: currentBadge._id.toString() }
                            );
                        }

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
                badgeProgressUpdated = true; // Mark badge progress as updated
            }
        }
    }

    // Move to next day if status was updated successfully
    if (status === BattleLogStatus.CRAVED || status === BattleLogStatus.CAVED) {
        // Only update battle progress and move to the next day if the status was valid
        if (!badgeProgressUpdated) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Could not update badge progress');
        }

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
    }

    await battle.save();
    return battle;
};


const getUserBattles = async (userId: string, status?: string) => {
    const matchStage: any = {
        userId: new Types.ObjectId(userId),
        isDeleted: false
    };

    if (status) {
        matchStage.battleStatus = status;
    }

    const battles = await Battle.aggregate([
        {
            $match: matchStage
        },
        {
            $addFields: {
                todayStatus: {
                    $cond: {
                        if: { $ne: ["$lastCheckInStatus", null] },
                        then: "$lastCheckInStatus",
                        else: "pending"
                    }
                },
                runningDay: "$day"
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return battles;
};

const getBattleById = async (battleId: string, userId: string) => {
    const battle = await Battle.findOne({
        _id: battleId,
        userId,
        isDeleted: false
    }).lean();

    if (!battle) {
        throw new AppError(httpStatus.NOT_FOUND, 'Battle not found');
    }

    const battleLogs = await BattleLog.find({ battleId, status: { $ne: null } }).sort({ day: 1 });

    const progressPercentage = battle.battleProgress || 0;
    const monsterOrderNumber = Math.min(Math.ceil(progressPercentage / 10) || 1, 11);

    const monster = await Monster.findOne({ orderNumber: monsterOrderNumber }).select('-orderNumber -createdAt -updatedAt -__v -_id').lean();

    // Get monster message based on addiction type and current day
    let monsterMessage = '';

    // Convert addiction type to match monster_messages key format
    // "Shopping Detox" -> "SHOPPING_DETOX"
    const addictionTypeKey = battle.addictionType
        .toUpperCase()
        .replace(/\s+/g, '_') as keyof typeof monster_messages;

    const currentDay = battle.day;

    // Direct access to messages array using the addiction type key
    if (monster_messages[addictionTypeKey]) {
        const messages = monster_messages[addictionTypeKey];

        // Find exact day match or the closest previous day
        const messageObj = messages
            .filter((msg) => msg.day <= currentDay)
            .sort((a, b) => b.day - a.day)[0];

        if (messageObj) {
            monsterMessage = messageObj.message;
        }
    }

    // Add monster_message to monster object
    const monsterWithMessage = monster ? {
        ...monster,
        monster_message: monsterMessage
    } : null;

    const battleWithStatus = {
        ...battle,
        todayStatus: battle.lastCheckInStatus !== null && battle.lastCheckInStatus !== undefined
            ? battle.lastCheckInStatus
            : "pending",
        runningDay: battle.day
    };

    return {
        battle: battleWithStatus,
        battleLogs,
        monster: monsterWithMessage
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