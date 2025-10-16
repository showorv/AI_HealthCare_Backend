import { Router } from "express";
import { drScheduleController } from "./doctor_schedule.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validate";
import { doctorZodValidation } from "./doctor_schedule.validation";


const router = Router()

router.post("/create",checkAuth(UserRole.DOCTOR), validateRequest(doctorZodValidation.drScheduleZodValidation) ,drScheduleController.createDoctorSchedule)

export const doctorScheduleRouter = router