import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";

import { drScheduleService } from "./doctor_schedule.service";



const createDoctorSchedule = catchAsync(async(req: Request & {user?:any}, res: Response)=>{

    const user = req.user
   const result = await drScheduleService.createDoctorSchedule(user,req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "doctor schedule create successfully!",
       data: result
   })

})



export const drScheduleController = {createDoctorSchedule}