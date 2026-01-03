import { Request, Response } from 'express';
import catchAsync from '../../utilities/catchAsync';
import { CommentServices } from './comment.service';
import sendResponse from '../../utilities/sendResponse';
import httpStatus from 'http-status';

// Create a comment
const createComment = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { commentText, authorId } = req.body;
    const commentBody = { postId, commentText, authorId };
    const comment = await CommentServices.createComment(commentBody);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
});

// Edit a comment
const editComment = catchAsync(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { commentText } = req.body;

    const updatedComment = await CommentServices.editComment(commentId, commentText);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
    });
});

// Delete a comment
const deleteComment = catchAsync(async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const result = await CommentServices.deleteComment(commentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
    });
});


const getAllCommentSignlePost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;

    const result = await CommentServices.getCommentsSinglePost(postId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comments retrieved successfully",
        data: result,
    });
});

export const CommentControllers = {
    createComment,
    editComment,
    deleteComment,
    getAllCommentSignlePost
};
