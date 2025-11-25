import { Types } from 'mongoose';

export interface IComment {
    postId: Types.ObjectId;
    authorId: Types.ObjectId;
    commentText: string;
}
