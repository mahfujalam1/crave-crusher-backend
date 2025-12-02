import cron from 'node-cron';
import { Battle } from '../battle/battle.model';
import { BattleStatus } from '../battle/battle.interface';
import { BattleLog } from '../battleLog/battleLog.model';
import { sendBatchPushNotification } from '../../helper/sendPushNotification';

// Run every day at 10:00 PM (22:00)
export const battleReminderCron = cron.schedule('0 22 * * *', async () => {
    console.log('Running battle reminder cron job...');

    try {
        // Find all active battles with reminder enabled
        const activeBattles = await Battle.find({
            battleStatus: BattleStatus.ACTIVE,
            sendReminder: true,
            isDeleted: false
        }).populate('userId');

        const usersToNotify: string[] = [];

        for (const battle of activeBattles) {
            // Check if today's battle log has no status
            const todayLog = await BattleLog.findOne({
                battleId: battle._id,
                day: battle.day,
                status: null
            });

            if (todayLog && battle.userId) {
                usersToNotify.push(battle.userId.toString());
            }
        }

        // Send batch notification
        if (usersToNotify.length > 0) {
            await sendBatchPushNotification(usersToNotify,
                'Battle Reminder',
                'Complete your battle today or lose progress!',
                { type: 'battle_reminder' }
            );
            console.log(`Sent reminders to ${usersToNotify.length} users`);
        }
    } catch (error) {
        console.error('Error in battle reminder cron:', error);
    }
});



export const markMissedDaysCron = cron.schedule('0 0 * * *', async () => {
    console.log('Running mark missed days cron job...');
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Find all active battles
        const activeBattles = await Battle.find({
            battleStatus: BattleStatus.ACTIVE,
            isDeleted: false
        });

        for (const battle of activeBattles) {
            const yesterdayDay = battle.day - 1;

            if (yesterdayDay > 0) {
                // Check if yesterday's log has no status
                const yesterdayLog = await BattleLog.findOne({
                    battleId: battle._id,
                    day: yesterdayDay,
                    status: null
                });

                if (yesterdayLog) {
                    yesterdayLog.status = 'missed' as any;
                    await yesterdayLog.save();
                    console.log(`Marked day ${yesterdayDay} as missed for battle ${battle._id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error in mark missed days cron:', error);
    }
});