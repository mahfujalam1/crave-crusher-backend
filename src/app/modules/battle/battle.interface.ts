import { Types } from 'mongoose';

export enum AddictionType {
    SMOKING_DETOX = 'Smoking Detox',
    SAVING_MONEY = 'Saving Money Battle',
    SOCIAL_MEDIA_DETOX = 'Social Media Detox',
    TOXIC_RELATIONSHIP = 'Toxic Relationship Battle',
    SHOPPING_DETOX = 'Shopping Detox',
    JUNK_FOOD = 'Junk Food Battle'
}

export enum AddictionLevel {
    VERY_LOW = 'Very Low',
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    VERY_HIGH = 'Very High'
}

export enum BattleStatus {
    ACTIVE = 'active',
    COMPLETE = 'complete',
    CANCEL = 'cancel'
}


export interface IBattle {
    userId: Types.ObjectId;
    addictionType: AddictionType;
    addictionLevel: AddictionLevel;
    battleLength: number;
    day: number;
    sendReminder: boolean;
    battleReason: string;
    battleProgress: number;
    battleStatus: BattleStatus;
    totalCrave: number;
    runningDay?: number;
    isDeleted: boolean;
    lastCheckInAt: Date | null;
    lastCheckInStatus: 'craved' | 'caved' | null;
}