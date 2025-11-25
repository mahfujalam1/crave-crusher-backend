import { Schema, model } from 'mongoose';

const VoteSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Vote = model('Vote', VoteSchema);
