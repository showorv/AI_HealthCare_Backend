import { UserRole } from '@prisma/client';
import express from 'express';

import { PrescriptionController } from './prescription.controller';
import checkAuth from '../../helper/checkAuth';
const router = express.Router();


router.post(
    "/",
    checkAuth(UserRole.DOCTOR),
    PrescriptionController.createPrescription
);

export const PrescriptionRoutes = router;