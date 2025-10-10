import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";


const createPaitent = catchAsync(async(req: Request, res: Response)=>{

   const result = await userService.createPaitent(req.body)

   sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "paitent created successfully",
    data: result
   })
    

})

export const userController = {createPaitent}