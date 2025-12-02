import { z } from 'zod';

const createBadgeValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Badge name is required'),
        day: z.number().optional(),
    })
});

const updateBadgeValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        day: z.number().min(1).optional(),
        orderNumber: z.number().min(1).optional()
    })
});

export const BadgeValidations = {
    createBadgeValidationSchema,
    updateBadgeValidationSchema
};