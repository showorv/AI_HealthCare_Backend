import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import { PrescriptionService } from "./prescription.service";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import pick from "../../helper/filtering";

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

const patientPrescription = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await PrescriptionService.patientPrescription(user as IJwtPayload, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Prescription fetched successfully',
        meta: result.meta,
        data: result.data
    });
});
export const PrescriptionController = {
    createPrescription,
    patientPrescription
}