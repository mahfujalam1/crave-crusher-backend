import { Schema, model } from 'mongoose';
import { IBadgeProgress } from './badgeProgress.interface';

const BadgeProgressSchema = new Schema<IBadgeProgress>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentProgress: { type: Number, default: 0 },
    craveCount: { type: Number, default: 0 },
    currentBadgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    nextBadgeId: { type: Schema.Types.ObjectId, ref: 'Badge', default: null },
    lastCraveDate: { type: Date, default: null },
}, { timestamps: true });

export const BadgeProgress = model<IBadgeProgress>('BadgeProgress', BadgeProgressSchema);