import { Types } from 'mongoose';

export interface IPost {
    authorId: Types.ObjectId;
    content: string;
    post_images: string[];
    totalVotes: number;
    totalComments: number;
    isDeleted: boolean;
}
