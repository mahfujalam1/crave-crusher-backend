import { Post } from './post.model';
import { IPost } from './post.interface';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import fs from 'fs';
import path from 'path';
import { Vote } from '../vote/vote.model';
import { Comment } from '../comment/comment.model';
import mongoose from 'mongoose';
import { UserBadge } from '../userBadge/userBadge.model';

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
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
    }
    if (post.authorId.toString() !== authorId) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this post");
    }

    if (deleted_images.length > 0) {
        deleted_images.forEach((imageUrl: string) => {
            const imageIndex = post.post_images.indexOf(imageUrl);
            if (imageIndex > -1) {
                post.post_images.splice(imageIndex, 1);

                const imagePath = path.resolve(imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        });
    }


    if (payload.post_images) {
        post.post_images = [...post.post_images, ...payload.post_images];
    }

    if (payload.content) {
        post.content = payload.content;
    }

    const updatedPost = await post.save();

    return updatedPost;
};

const getPostById = async (postId: string, userId: string) => {
    const post = await Post.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(postId), isDeleted: false }
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
            $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
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
                hasVoted: 1,
                author: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    profileImage: 1
                }
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
        // Match only posts that are not deleted
        {
            $match: {
                isDeleted: false
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'authorId', 
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: {
                path: "$author", 
                preserveNullAndEmptyArrays: true 
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
                hasVoted: 1,
                author: {
                    _id: 1,
                    fullName: 1,
                    email: 1, 
                    profileImage: 1
                }
            }
        }
    ]);

    // Check if any posts were found
    if (posts.length === 0) {
        return { message: 'No posts found.' };  // Or return an empty array []
    }

    return posts;
};


const getMyPosts = async (userId: string) => {
    const posts = await Post.aggregate([
        // Filter posts by authorId (userId)
        {
            $match: {
                authorId: new mongoose.Types.ObjectId(userId),
                isDeleted: false
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
        {
            $addFields: {
                hasVoted: {
                    $in: [new mongoose.Types.ObjectId(userId), { $map: { input: "$votes", as: "vote", in: "$$vote.userId" } }]
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
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
                hasVoted: 1,
                author: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    profileImage: 1
                }
            }
        }
    ]);

    // Calculate total reactions (sum of all totalVotes)
    const totalReaction = posts.reduce((sum, post) => sum + (post.totalVotes || 0), 0);

    // Get total badges for the user
    const userBadges = await UserBadge.find({ userId: new mongoose.Types.ObjectId(userId) });
    const totalBadge = userBadges.length;

    // Get total posts count
    const totalPost = posts.length;

    return {
        posts,
        totalReaction,
        totalBadge,
        totalPost
    };
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


const getSingleUserPosts = async (userId: string) => {
    const posts = await Post.aggregate([
        // Filter posts by authorId (userId)
        {
            $match: {
                authorId: new mongoose.Types.ObjectId(userId),
                isDeleted: false
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
        {
            $addFields: {
                hasVoted: {
                    $in: [new mongoose.Types.ObjectId(userId), { $map: { input: "$votes", as: "vote", in: "$$vote.userId" } }]
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
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
                hasVoted: 1,
                author: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    profileImage: 1
                }
            }
        }
    ]);

    // Calculate total reactions (sum of all totalVotes)
    const totalReaction = posts.reduce((sum, post) => sum + (post.totalVotes || 0), 0);

    // Get total badges for the user
    const userBadges = await UserBadge.find({ userId: new mongoose.Types.ObjectId(userId) });
    const totalBadge = userBadges.length;

    // Get total posts count
    const totalPost = posts.length;

    return {
        posts,
        totalReaction,
        totalBadge,
        totalPost
    };
};

export const PostServices = {
    createPostIntoDB,
    getPostById,
    getAllPosts,
    updatePostIntoDB,
    deletePostFormDB,
    getPostsByUser,
    getMyPosts,
    getSingleUserPosts
}
