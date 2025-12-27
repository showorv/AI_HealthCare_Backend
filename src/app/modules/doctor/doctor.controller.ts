import { Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { doctorService } from "./doctor.service"
import pick from "../../helper/filtering"
import httpStatus from 'http-status';
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

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await doctorService.getByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor retrieval successfully',
        data: result,
    });
});

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

const getAiSuggestion = catchAsync(async (req: Request, res: Response) => {
    const { symptoms } = req.body;

    // Basic validation
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 5) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Please provide valid symptoms for doctor suggestion (minimum 5 characters).',
        });
    }

    const result = await doctorService.getAiSuggestion({ symptoms: symptoms.trim() });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'AI doctor suggestions retrieved successfully',
        data: result,
    });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await doctorService.deleteFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor deleted successfully',
        data: result,
    });
});


export const doctorController = {getAllFromDB,getByIdFromDB, updateDoctor,getAiSuggestion,deleteFromDB}