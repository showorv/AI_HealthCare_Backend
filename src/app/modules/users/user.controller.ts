import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/filtering";
import { IJwtPayload } from "../../types/common";


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


// const getAll = catchAsync(async (req: Request, res: Response) => {
   

//    const {page,limit,searchItem, sortBy,sortOrder,role,status} = req.query

//    const result = await userService.getAll({ page: Number(page), limit: Number(limit), searchItem, sortBy, sortOrder, role,status});
//    sendResponse(res, {
//        statusCode: 201,
//        success: true,
//        message: "user retrived successfuly!",
//        data: result
//    })
// });


const getAll = catchAsync(async (req: Request, res: Response) => {
   
   const fields =  pick(req.query, ["role","status","email","searchItem"])
   const options = pick(req.query, ["page","limit", "sortBy","sortOrder"])

  
   const result = await userService.getAll(fields, options);
   sendResponse(res, {
       statusCode: 201,
       success: true,
       message: "user retrived successfuly!",
       data: result.data,
       meta: result.meta
   })
});

const getMyProfile = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response) => {

   const user = req.user;

   const result = await userService.getMyProfile(user as IJwtPayload);

   sendResponse(res, {
       statusCode: 200,
       success: true,
       message: "My profile data fetched!",
       data: result
   })
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {

   const { id } = req.params;
   const result = await userService.changeProfileStatus(id, req.body)

   sendResponse(res, {
       statusCode: 200,
       success: true,
       message: "Users profile status changed!",
       data: result
   })
});

export const userController = {createPaitent,createAdmin,createDoctor,getAll,getMyProfile,changeProfileStatus}