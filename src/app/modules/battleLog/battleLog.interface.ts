import { Types } from 'mongoose';

export enum BattleLogStatus {
    CRAVED = 'craved',
    CAVED = 'caved',
    MISSED = 'missed'
}

export interface IBattleLog {
    battleId: Types.ObjectId;
    day: number;
    status: BattleLogStatus | null;
}