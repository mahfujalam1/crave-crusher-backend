import cron from 'node-cron';
import { Battle } from '../battle/battle.model';
import { BattleStatus } from '../battle/battle.interface';
import { BattleLog } from '../battleLog/battleLog.model';
import { sendBatchPushNotification } from '../../helper/sendPushNotification';
import { BattleLogStatus } from '../battleLog/battleLog.interface';

// Run every day at 10:00 PM (22:00)
// TESTING VERSION - Runs every 3 minutes
export const battleReminderCron = cron.schedule('0 22 * * *', async () => {

    try {
        // Don't populate - just get userId directly
        const activeBattles = await Battle.find({
            battleStatus: BattleStatus.ACTIVE,
            sendReminder: true,
            isDeleted: false
        }).select('_id userId day'); // Select only needed fields


        const usersToNotify = new Set<string>();

        for (const battle of activeBattles) {
            try {
                const todayLog = await BattleLog.findOne({
                    battleId: battle._id,
                    day: battle.day,
                    status: null
                });

                if (todayLog && battle.userId) {
                    usersToNotify.add(battle.userId.toString());
                }
            } catch (err) {
                continue;
            }
        }

        const userArray = Array.from(usersToNotify);

        if (userArray.length > 0) {

            await sendBatchPushNotification(
                userArray,
                '⚔️ Battle Reminder',
                "Complete today's battle or lose your streak!",
                { type: 'battle_reminder', screen: 'BattleScreen' }
            );

        } else {
            console.log('✅ No reminders needed - all battles completed!');
        }

    } catch (error) {
        console.error('❌ Critical error in cron:', error);
    }
});




export const markMissedDaysCron = cron.schedule('0 0 * * *', async () => {

    try {
        // Find all active battles
        const activeBattles = await Battle.find({
            battleStatus: BattleStatus.ACTIVE,
            isDeleted: false
        }).select('_id day battleStatus createdAt');


        if (activeBattles.length === 0) {
            return;
        }

        let markedCount = 0;
        let alreadyCompletedCount = 0;
        let skippedCount = 0;

        for (const battle of activeBattles) {
            try {
                // Current battle day
                const currentBattleDay = battle.day;

                const previousDay = currentBattleDay - 1;
                if (previousDay < 1) {
                    skippedCount++;
                    continue;
                }

                // Find previous day's log
                const previousDayLog = await BattleLog.findOne({
                    battleId: battle._id,
                    day: previousDay
                });

                if (!previousDayLog) {
                    await BattleLog.create({
                        battleId: battle._id,
                        day: previousDay,
                        status: BattleLogStatus.MISSED
                    });
                    markedCount++;
                    continue;
                }
                if (previousDayLog.status === null || previousDayLog.status === undefined) {
                    previousDayLog.status = BattleLogStatus.MISSED;
                    await previousDayLog.save();
                    markedCount++;
                } else {
                    alreadyCompletedCount++;
                }

            } catch (battleError) {
                console.error(`❌ Error processing battle ${battle._id}:`, battleError);
                continue;
            }
        }


    } catch (error) {
        console.error('❌ Critical error in mark missed days cron:', error);
    }
}, {
    timezone: "UTC"
});