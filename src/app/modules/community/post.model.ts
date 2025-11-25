import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

const PostSchema = new Schema<IPost>({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    post_images: { type: [String], required: true },
    totalVotes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
},
    { timestamps: true }
);

export const Post = model<IPost>('Post', PostSchema);   
