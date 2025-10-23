import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { appointmentService } from "./appointment.service"
import { IJwtPayload } from "../../types/common"
import pick from "../../helper/filtering"


const createAppointment = catchAsync(async(req: Request & {user?: IJwtPayload} , res: Response)=>{

    const user = req.user

   const result = await appointmentService.createAppointment(user as IJwtPayload, req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "appointment created successfully!",
       data: result
      
   })

})


const getAppointment = catchAsync(async(req: Request & {user?: IJwtPayload} , res: Response)=>{


   const fields =  pick(req.query, ["status","paymentStatus"])
   const options = pick(req.query, ["page","limit", "sortBy","sortOrder"])
    const user = req.user

   const result = await appointmentService.getAppointment(user as IJwtPayload,fields,options)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "appointment retrived successfully!",
       data: result.data,
       meta: result.metaData
      
   })

})


const updateAppointmentStatus = catchAsync(async(req: Request & {user?: IJwtPayload} , res: Response)=>{


   const {id} = req.params
   const {status} = req.body
    const user = req.user

   const result = await appointmentService.updateAppointmentStatus(id,status,user as IJwtPayload)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "appointment status update successfully!",
       data: result
     
      
   })

})




export const appointmentController = {createAppointment,getAppointment,updateAppointmentStatus}