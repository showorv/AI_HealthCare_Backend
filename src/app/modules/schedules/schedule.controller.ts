import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { scheduleService } from "./schedule.service";
import pick from "../../helper/filtering";



const createSchedule = catchAsync(async(req: Request, res: Response)=>{

   const result = await scheduleService.createSchedule(req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "schedule create successfully!",
       data: result
   })

})


const getScheduleForDoctor = catchAsync(async(req: Request, res: Response)=>{

    const fields =  pick(req.query, ["startDateTime","endDateTime"])
   const options = pick(req.query, ["page","limit", "sortBy","sortOrder"])


   const result = await scheduleService.getScheduleForDoctor(fields, options)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "schedule retrived successfully!",
       data: result.data,
       meta: result.meta
       
   })

})

const deleteSchedule = catchAsync(async(req: Request, res: Response)=>{




   const result = await scheduleService.deleteSchedule(req.params.id)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "schedule deleted successfully!",
       data: result
      
       
   })

})

export const scheduleController = {createSchedule,getScheduleForDoctor,deleteSchedule}