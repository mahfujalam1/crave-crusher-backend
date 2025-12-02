import { Schema, model } from 'mongoose';
import { IBattleLog, BattleLogStatus } from './battleLog.interface';

const BattleLogSchema = new Schema<IBattleLog>({
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true },
    day: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(BattleLogStatus),
        default: null
    }
}, { timestamps: true });

export const BattleLog = model<IBattleLog>('BattleLog', BattleLogSchema);