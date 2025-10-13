import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";


const createPaitent = catchAsync(async(req: Request, res: Response)=>{

   const result = await userService.createPaitent(req)
   // console.log(req);
   

   sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "paitent created successfully",
    data:result
   })
    

})

const createAdmin = catchAsync(async (req: Request, res: Response) => {

   const result = await userService.createAdmin(req);
   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "Admin Created successfuly!",
       data: result
   })
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {

   const result = await userService.createDoctor(req);
   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "Doctor Created successfuly!",
       data: result
   })
});


const getAll = catchAsync(async (req: Request, res: Response) => {

   const {page,limit} = req.query

   const result = await userService.getAll({ page: Number(page), limit: Number(limit)});
   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "user retrived successfuly!",
       data: result
   })
});

export const userController = {createPaitent,createAdmin,createDoctor,getAll}