import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { scheduleService } from "./schedule.service";



const createSchedule = catchAsync(async(req: Request, res: Response)=>{

   const result = await scheduleService.createSchedule(req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "schedule create successfully!",
       data: result
   })


    

})

export const scheduleController = {createSchedule}