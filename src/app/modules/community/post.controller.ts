import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { PostServices } from './post.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';


const createPost = catchAsync(async (req: Request, res: Response) => {
    const { files } = req;
    if (files && typeof files === 'object' && 'post_images' in files) {
        req.body.post_images = files['post_images'].map(
            (file) => `${file.path}`,
        );
    }

    const post = await PostServices.createPostIntoDB(req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Create Post successfully",
        data: post,
    });
});


const updatePost = catchAsync(async (req: Request, res: Response) => {
    const { files, body } = req;
    const { id } = req.params;

    const token = req.user;
    const deleted_images: string[] = JSON.parse(body.deleted_images || '[]');

    // Prepare new images if available
    if (files && typeof files === 'object' && 'post_images' in files) {
        body.post_images = files['post_images'].map((file: any) => file.path);
    }

    // Call service function to update the post and handle image deletion
    const result = await PostServices.updatePostIntoDB(id, body, deleted_images, token?.id);

    // Respond with the updated post data
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post updated successfully",
        data: result,
    });
});



const getPostById = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const post = await PostServices.getPostById(postId);
    if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
    }
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single post retrieved successfully",
        data: post,
    });
});


const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const posts = await PostServices.getAllPosts();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All posts retrieved successfully",
        data: posts,
    });
});


const deletePost = catchAsync(async (req: Request, res: Response) => {
    const {postId} = req.params

    const result = await PostServices.deletePostFormDB(postId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Deleted post successfully",
        data: result,
    });
});

export const PostControllers = {
    createPost,
    getPostById,
    getAllPosts,
    updatePost,
    deletePost
}
