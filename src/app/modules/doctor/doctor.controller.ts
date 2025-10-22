import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { doctorService } from "./doctor.service"
import pick from "../../helper/filtering"

const getAllFromDB = catchAsync(async(req: Request , res: Response)=>{

    const fields =  pick(req.query, ["name","contactNumber","email","gender","appointmentFee","doctorSpecialist", "searchItem","specialist"])
   const options = pick(req.query, ["page","limit", "sortBy","sortOrder"])


   const result = await doctorService.getAllFromDB(fields, options)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "doctor retrived successfully!",
       data: result.data,
       meta: result.metaData
   })

})


const updateDoctor = catchAsync(async(req: Request , res: Response)=>{

    const id = req.params.id

   const result = await doctorService.updateDoctor(id, req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "doctor updated successfully!",
       data: result
   })

})

const getAiSuggestion = catchAsync(async(req: Request , res: Response)=>{


   const result = await doctorService.getAiSuggestion( req.body)


   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "Ai doctor fetched successfully!",
       data: result
   })

})



export const doctorController = {getAllFromDB, updateDoctor,getAiSuggestion}