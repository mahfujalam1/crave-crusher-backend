import { z } from 'zod';

// Validation schema for creating a post
const createPostValidationSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Content is required'),
    }),
});

// Validation schema for updating a post
const updatePostValidationSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Content is required').optional(),
    }),
});

export const PostValidations = {
    createPostValidationSchema,
    updatePostValidationSchema,
};

