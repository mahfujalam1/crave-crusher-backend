import { Schema, model } from 'mongoose';
import { IUserBadge } from './userBadge.interface';

const UserBadgeSchema = new Schema<IUserBadge>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    isClaim: { type: Boolean, default: false }
}, { timestamps: true });

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = model<IUserBadge>('UserBadge', UserBadgeSchema);