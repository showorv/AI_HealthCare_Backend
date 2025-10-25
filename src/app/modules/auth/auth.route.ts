import { Router } from "express";

import { authController } from "./auth.controller";
import { UserRole } from "@prisma/client";
import checkAuth from "../../helper/checkAuth";


const router = Router()

router.get(
    "/me",
    authController.getMe
)

router.post("/login", 

authController.login
)

router.post(
    '/refresh-token',
    authController.refreshToken
)

router.post(
    '/change-password',
    checkAuth(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    authController.changePassword
);

router.post(
    '/forgot-password',
    authController.forgotPassword
);

router.post(
    '/reset-password',
    authController.resetPassword
)

export const authRouter = router