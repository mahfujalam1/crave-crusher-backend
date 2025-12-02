import { Types } from 'mongoose';

export interface IBadgeProgress {
    userId: Types.ObjectId;
    currentProgress: number;
    craveCount: number;
    currentBadgeId: Types.ObjectId;
    nextBadgeId: Types.ObjectId | null;
    lastCraveDate: Date | null;
}