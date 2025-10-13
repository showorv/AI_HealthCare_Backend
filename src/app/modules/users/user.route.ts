import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { userValidation } from "./user.validation";


const router = Router()


router.get("/", userController.getAll)

router.post("/create-paitent", fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.paitentValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createPaitent(req,res,next)
},

// userController.createPaitent
)
router.post("/create-admin", fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createAdmin(req,res,next)
},

// userController.createPaitent
)
router.post("/create-doctor", fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.createDoctorValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createDoctor(req,res,next)
},

// userController.createPaitent
)

export const userRouter = router