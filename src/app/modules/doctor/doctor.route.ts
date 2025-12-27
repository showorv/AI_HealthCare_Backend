import { Router } from "express";

import { doctorController } from "./doctor.controller";
import checkAuth from "../../helper/checkAuth";
import { UserRole } from "@prisma/client";



const router = Router()
router.get("/", doctorController.getAllFromDB)

router.post("/suggestion", doctorController.getAiSuggestion)

router.get('/:id', doctorController.getByIdFromDB);

router.patch("/:id",checkAuth(UserRole.DOCTOR, UserRole.ADMIN), doctorController.updateDoctor)
// router.delete("/:id", scheduleController.deleteSchedule)
router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    doctorController.deleteFromDB
);
export const doctorRouter = router