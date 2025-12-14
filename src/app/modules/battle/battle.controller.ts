import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { BattleServices } from './battle.service';

const createBattle = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await BattleServices.createBattleIntoDB(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Battle created successfully',
        data: result
    });
});

const updateBattleStatus = catchAsync(async (req: Request, res: Response) => {
    const { battleId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const result = await BattleServices.updateBattleDayStatus(battleId, userId, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Battle status updated successfully',
        data: result
    });
});

const getUserBattles = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { status } = req.query;
    const result = await BattleServices.getUserBattles(userId, status as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Battles retrieved successfully',
        data: result
    });
});

const getBattleById = catchAsync(async (req: Request, res: Response) => {
    const { battleId } = req.params;
    const userId = req.user.id;

    const result = await BattleServices.getBattleById(battleId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Battle retrieved successfully',
        data: result
    });
});

const cancelBattle = catchAsync(async (req: Request, res: Response) => {
    const { battleId } = req.params;
    const userId = req.user.id;

    const result = await BattleServices.cancelBattle(battleId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Battle cancelled successfully',
        data: result
    });
});

export const BattleControllers = {
    createBattle,
    updateBattleStatus,
    getUserBattles,
    getBattleById,
    cancelBattle
};