import { z } from 'zod';

// Validation schema for creating a post
const createPostValidationSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Content is required'),
        post_images: z.array(z.string())
            .max(5, 'You cannot upload more than 5 images per post')
            .optional(),
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

