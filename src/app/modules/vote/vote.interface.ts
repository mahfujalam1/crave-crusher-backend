import { Types } from 'mongoose';

export interface IVote {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
}
