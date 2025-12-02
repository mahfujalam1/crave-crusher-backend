import { Schema, model } from 'mongoose';
import { IBadge } from './badge.interface';

const BadgeSchema = new Schema<IBadge>({
    name: { type: String, required: true },
    badge_image: { type: String, required: true },
    day: { type: Number, default: 0 },
    orderNumber: { type: Number, required: true, unique: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Badge = model<IBadge>('Badge', BadgeSchema);