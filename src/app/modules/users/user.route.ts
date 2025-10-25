import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import { fileUploader } from "../../helper/fileUploader";
import { userValidation } from "./user.validation";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";


const router = Router()


router.get("/",checkAuth(UserRole.ADMIN),  userController.getAll)

router.get(
    '/me',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    userController.getMyProfile
)
router.post("/create-paitent", fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.paitentValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createPaitent(req,res,next)
},

// userController.createPaitent
)
router.post("/create-admin",checkAuth(UserRole.ADMIN), fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createAdmin(req,res,next)
},

// userController.createPaitent
)
router.post("/create-doctor",checkAuth(UserRole.ADMIN), fileUploader.upload.single("file"), 

(req: Request, res: Response, next: NextFunction)=> {

    req.body = userValidation.createDoctorValidationSchema.parse(JSON.parse(req.body.data))
    return userController.createDoctor(req,res,next)
},

// userController.createPaitent
)
router.patch(
    '/:id/status',
    checkAuth(UserRole.ADMIN),
    userController.changeProfileStatus
);
export const userRouter = router