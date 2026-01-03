import { Request, Response } from "express";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import httpStatus from "http-status";
import { MonsterServices } from "./monster.service";

const createMonster = catchAsync(async (req: Request, res: Response) => {
    const { files } = req;
    const orderNumber = (req.body.orderNumber) ? parseInt(req.body.orderNumber, 10) : undefined;
    let imageUrl;
    if (files && !Array.isArray(files) && files.monster_image && files.monster_image[0]) {
        imageUrl = files.monster_image[0].path;
    }
    const bodyData: any = {orderNumber};
    if (imageUrl) {
        bodyData.monster_image = imageUrl;
    }

    const monster = await MonsterServices.createMonster(bodyData)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Create monster successfully",
        data: monster,
    });
});


export const MonsterControllers = {
    createMonster
}