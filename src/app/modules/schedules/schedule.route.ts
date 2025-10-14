import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";



const router = Router()
router.get("/",checkAuth(UserRole.ADMIN, UserRole.DOCTOR), scheduleController.getScheduleForDoctor)

router.post("/create", scheduleController.createSchedule)



router.delete("/:id", scheduleController.deleteSchedule)

export const scheduleRouter = router