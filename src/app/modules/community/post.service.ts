import { Post } from './post.model';
import { IPost } from './post.interface';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';
import { Vote } from '../vote/vote.model';
import { Comment } from '../comment/comment.model';
import mongoose from 'mongoose';

const createPostIntoDB = async (payload: Partial<IPost>) => {
    const post = new Post(payload);
    await post.save();
    return post;
};

const updatePostIntoDB = async (
    id: string,
    payload: Partial<IPost>,
    deleted_images: string[],
    authorId: string
) => {
    // Fetch the post by ID
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
    }

    // Check if the user is authorized to update the post
    if (post.authorId.toString() !== authorId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this post");
    }

    // 1. Handle the image deletion logic
    if (deleted_images.length > 0) {
        deleted_images.forEach((imageUrl: string) => {
            // Check if the image exists in the current post images array
            const imageIndex = post.post_images.indexOf(imageUrl);
            if (imageIndex > -1) {
                // If the image is found in the post images, remove it from the database
                post.post_images.splice(imageIndex, 1); // Remove from post's images array

                // Now, delete the image from the file system
                const imagePath = path.resolve(imageUrl); // Get the full path to the image
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete the image from file system
                }
            }
        });
    }

    // 2. Handle adding new images to the post
    if (payload.post_images) {
        // Add the new images to the post's images array
        post.post_images = [...post.post_images, ...payload.post_images];
    }

    // 3. Update the other fields of the post if any
    if (payload.content) {
        post.content = payload.content;
    }

    const updatedPost = await post.save();

    return updatedPost;
};

const getPostById = async (postId: string, userId: string) => {
    const post = await Post.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(postId) }
        },
        {
            $lookup: {
                from: 'votes',
                localField: '_id',
                foreignField: 'postId',
                as: 'votes'
            }
        },
        {
            $addFields: {
                hasVoted: {
                    $in: [new mongoose.Types.ObjectId(userId), { $map: { input: "$votes", as: "vote", in: "$$vote.userId" } }]
                }
            }
        },
        {
            $project: {
                content: 1,
                post_images: 1,
                totalVotes: 1,
                totalComments: 1,
                isDeleted: 1,
                createdAt: 1,
                updatedAt: 1,
                hasVoted: 1
            }
        }
    ]);

    return post[0] || null;
};

const getAllPosts = async (userId: string) => {
    const posts = await Post.aggregate([
        {
            $lookup: {
                from: 'votes',
                localField: '_id',
                foreignField: 'postId',
                as: 'votes'
            }
        },
        {
            $addFields: {
                hasVoted: {
                    $in: [new mongoose.Types.ObjectId(userId), { $map: { input: "$votes", as: "vote", in: "$$vote.userId" } }]
                }
            }
        },
        {
            $project: {
                content: 1,
                post_images: 1,
                totalVotes: 1,
                totalComments: 1,
                isDeleted: 1,
                createdAt: 1,
                updatedAt: 1,
                hasVoted: 1
            }
        }
    ]);

    return posts;
};

const getMyPosts = async (userId: string) => {
    const posts = await Post.aggregate([
        // Filter posts by authorId (userId)
        {
            $match: {
                authorId: new mongoose.Types.ObjectId(userId)
            }
        },
        // Fetch all votes related to the posts
        {
            $lookup: {
                from: 'votes',  // Join with the 'votes' collection
                localField: '_id',  // Field from 'Post' collection
                foreignField: 'postId',  // Field from 'Vote' collection
                as: 'votes'  // Create an array of votes
            }
        },
        // Add a 'hasVoted' field to each post
        {
            $addFields: {
                hasVoted: {
                    $in: [new mongoose.Types.ObjectId(userId), { $map: { input: "$votes", as: "vote", in: "$$vote.userId" } }]
                }
            }
        },
        // Specify the fields you want in the result
        {
            $project: {
                content: 1,
                post_images: 1,
                totalVotes: 1,
                totalComments: 1,
                isDeleted: 1,
                createdAt: 1,
                updatedAt: 1,
                hasVoted: 1  // Include hasVoted in the result
            }
        }
    ]);

    return posts;
};



const deletePostFormDB = async (id: string,) => {
    const post = await Post.findOne({ _id: id, isDeleted: false })
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post Not Found!")
    }
    const deletePost = await Post.findByIdAndUpdate(id, { isDeleted: true })
    return deletePost;
}


const getPostsByUser = async (userId: string) => {
    const posts = await Post.find({ authorId: userId, isDeleted: false }).populate({
        path: "authorId",
        select: 'fullName email profileImage'
    });

    const postsWithCommentsAndVotes = await Promise.all(posts.map(async (post) => {
        // Fetch comments for this post
        const comments = await Comment.find({ postId: post._id }).populate({
            path: 'authorId',
            select: 'fullName profileImage'
        });

        const votes = await Vote.find({ postId: post._id }).populate({
            path: 'userId',
            select: 'fullName email profileImage'
        });

        return {
            ...post.toObject(),
            comments,
            votes
        };
    }));

    return postsWithCommentsAndVotes;
};

export const PostServices = {
    createPostIntoDB,
    getPostById,
    getAllPosts,
    updatePostIntoDB,
    deletePostFormDB,
    getPostsByUser,
    getMyPosts
}
