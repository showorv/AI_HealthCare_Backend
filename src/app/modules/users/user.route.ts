import { Router } from "express";
import { userController } from "./user.controller";


const router = Router()

router.post("/create-paitent", userController.createPaitent)

export const userRouter = router