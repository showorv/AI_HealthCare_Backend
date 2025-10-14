import { Router } from "express";
import { drScheduleController } from "./doctor_schedule.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";


const router = Router()

router.post("/create",checkAuth(UserRole.DOCTOR), drScheduleController.createDoctorSchedule)

export const doctorScheduleRouter = router