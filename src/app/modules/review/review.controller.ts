import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { reviewService } from "./review.service";


const createReview = catchAsync(async (req: Request & {user?:IJwtPayload}, res: Response) => {

    const user = req.user
    const result = await reviewService.createReview(user as IJwtPayload, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "review created successfully!",
        data: result
    });
});



export const reviewController = {
createReview
};