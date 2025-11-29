import { Vote } from './vote.model';
import { Post } from '../community/post.model';

const createVote = async (payload: any) => {
    const existingVote = await Vote.findOne({ userId: payload.userId, postId: payload.postId });

    if (existingVote) {
        await Vote.deleteOne({ _id: existingVote._id });
        await Post.updateOne({ _id: payload.postId }, { $inc: { totalVotes: -1 } });
        return { success: true, message: "Vote removed successfully" };
    } else {
        const vote = new Vote(payload);
        await vote.save();
        await Post.updateOne({ _id: payload.postId }, { $inc: { totalVotes: 1 } });
        return { success: true, message: "Vote added successfully" };
    }
};


const getAllVoteAPost = async (postId: string) => {
    const votes = await Vote.find({postId})
    return votes
}

export const VoteServices = {
    createVote,
    getAllVoteAPost
}
