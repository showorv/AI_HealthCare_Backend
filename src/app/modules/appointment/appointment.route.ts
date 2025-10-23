import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";



const router = Router()


router.post("/",checkAuth(UserRole.PATIENT), appointmentController.createAppointment)


export const appointmentRouter = router