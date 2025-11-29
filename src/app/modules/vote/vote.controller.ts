import { Request, Response } from 'express';
import { VoteServices } from './vote.service';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';

const votePost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { userId } = req.body;
    const vote = await VoteServices.createVote({
        userId,
        postId,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Vote added successfully",
        data: vote,
    });
});


const allVoteForSinglePost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const votes = await VoteServices.getAllVoteAPost(postId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Votes retrieved successfully",
        data: votes,
    });
});


export const VoteControllers = {
    votePost,
    allVoteForSinglePost,
}
