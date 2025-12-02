import { Types } from 'mongoose';

export enum BattleLogStatus {
    CRAVE = 'crave',
    CAVED = 'caved',
    MISSED = 'missed'
}

export interface IBattleLog {
    battleId: Types.ObjectId;
    day: number;
    status: BattleLogStatus | null;
}