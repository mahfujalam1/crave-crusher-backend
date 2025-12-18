import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

const PostSchema = new Schema<IPost>({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    post_images: {
        type: [String],
        validate: {
            validator: function (images: string[]) {
                return images.length <= 5;
            },
            message: 'You cannot upload more than 5 images per post'
        }
    },
    totalVotes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
},
    { timestamps: true }
);

export const Post = model<IPost>('Post', PostSchema);