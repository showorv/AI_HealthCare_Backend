import { Router } from "express";
import { scheduleController } from "./schedule.controller";



const router = Router()
router.get("/", scheduleController.getScheduleForDoctor)

router.post("/create", scheduleController.createSchedule)



router.delete("/:id", scheduleController.deleteSchedule)

export const scheduleRouter = router