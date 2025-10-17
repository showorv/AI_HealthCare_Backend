import { Router } from "express";

import { doctorController } from "./doctor.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";



const router = Router()
router.get("/", doctorController.getAllFromDB)

// router.post("/create", doctorController.getAllFromDB)


router.patch("/:id",checkAuth(UserRole.DOCTOR), doctorController.updateDoctor)
// router.delete("/:id", scheduleController.deleteSchedule)

export const doctorRouter = router