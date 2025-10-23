import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";



const router = Router()


router.post("/",checkAuth(UserRole.PATIENT), appointmentController.createAppointment)
router.get("/",checkAuth(UserRole.PATIENT,UserRole.DOCTOR), appointmentController.getAppointment)


router.patch("/status/:id",checkAuth(UserRole.ADMIN,UserRole.DOCTOR), appointmentController.updateAppointmentStatus)


export const appointmentRouter = router