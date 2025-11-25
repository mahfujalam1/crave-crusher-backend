import { Schema, model } from 'mongoose';

const CommentSchema = new Schema(
    {
        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        commentText: { type: String, required: true },
    },
    { timestamps: true }
);

export const Comment = model('Comment', CommentSchema);
