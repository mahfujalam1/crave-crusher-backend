import { Comment } from './comment.model';
import { Post } from '../community/post.model';

// Create a comment
const createComment = async (payload: any) => {
    const comment = new Comment(payload);
    await comment.save();

    // Update post comment count
    const post = await Post.findById(payload.postId);
    if (post) {
        await post.updateOne({ $inc: { totalComments: 1 } });
    }
    return comment;
};

// Edit a comment
const editComment = async (commentId: string, newText: string) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error('Comment not found');
    }

    comment.commentText = newText;
    await comment.save();
    return comment;
};

// Delete a comment
const deleteComment = async (commentId: string) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error('Comment not found');
    }

    await Comment.findByIdAndDelete(commentId);

    // Update the post's comment count
    const post = await Post.findById(comment.postId);
    if (post) {
        await post.updateOne({ $inc: { totalComments: -1 } });
    }

    return { message: 'Comment deleted successfully' };
};

const getCommentsSinglePost= async(postId:string)=>{
    const comments = await Comment.find({postId}).populate({path:'authorId', select:"fullName"})
    return comments
}

export const CommentServices = {
    createComment,
    editComment,
    deleteComment,
    getCommentsSinglePost
};
