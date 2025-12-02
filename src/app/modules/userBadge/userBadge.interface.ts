import { Types } from 'mongoose';

export interface IUserBadge {
    userId: Types.ObjectId;
    badgeId: Types.ObjectId;
    isClaim: boolean;
}