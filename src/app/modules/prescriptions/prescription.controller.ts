import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";

const createPrescription = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescription(user as IJwtPayload, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "prescription created successfully!",
        data: result
    })
})

export const PrescriptionController = {
    createPrescription
}