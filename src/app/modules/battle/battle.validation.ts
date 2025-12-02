import { z } from 'zod';

const createBattleValidationSchema = z.object({
    body: z.object({
        addictionType: z.enum([
            'Smoking Detox',
            'Saving Money Battle',
            'Social Media Detox',
            'Toxic Relationship Battle',
            'Shopping Detox',
            'Junk Food Battle'
        ]),
        addictionLevel: z.enum(['Very Low', 'Low', 'Medium', 'High', 'Very High']),
        battleLength: z.number().min(1, 'Battle length must be at least 1 day'),
        battleReason: z.string().min(1, 'Battle reason is required'),
        sendReminder: z.boolean().optional()
    })
});

const updateBattleStatusValidationSchema = z.object({
    body: z.object({
        status: z.enum(['crave', 'caved', 'missed'])
    })
});

export const BattleValidations = {
    createBattleValidationSchema,
    updateBattleStatusValidationSchema
};