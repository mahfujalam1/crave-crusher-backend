import { Schema, model } from 'mongoose';
import { IBattle, AddictionType, AddictionLevel, BattleStatus } from './battle.interface';

const BattleSchema = new Schema<IBattle>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    addictionType: { type: String, enum: Object.values(AddictionType), required: true },
    addictionLevel: { type: String, enum: Object.values(AddictionLevel), required: true },
    battleLength: { type: Number, required: true },
    day: { type: Number, default: 1 },
    sendReminder: { type: Boolean, default: true },
    battleReason: { type: String, required: true },
    battleProgress: { type: Number, default: 0 },
    battleStatus: { type: String, enum: Object.values(BattleStatus), default: BattleStatus.ACTIVE },
    totalCrave: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    lastCheckInAt: { type: Date, default: null },
    lastCheckInStatus: {
        type: String,
        enum: ['craved', 'caved'],
        default: null
    }
}, { timestamps: true });

export const Battle = model<IBattle>('Battle', BattleSchema);
