import mongoose, { model } from "mongoose";
import { IMonster } from "./monster.interface";

const monster = new mongoose.Schema(
    {
        monster_image: {
            type: String,
            required: true,
        },
        orderNumber: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const Monster = model<IMonster>('Monster', monster);