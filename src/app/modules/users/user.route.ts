import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { userValidation } from "./user.validation";


const router = Router()

router.post("/create-paitent", fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.paitentValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createPaitent(req,res,next)
},

// userController.createPaitent
)

export const userRouter = router