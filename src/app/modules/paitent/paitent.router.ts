import express from 'express';

import { UserRole } from '@prisma/client';
import { PatientController } from './paitent.controller';
import checkAuth from '../../helper/checkAuth';

const router = express.Router();

router.get(
    '/',
    PatientController.getAllFromDB
);

router.get(
    '/:id',
    PatientController.getByIdFromDB
);

router.patch(
    '/',
    checkAuth(UserRole.PATIENT),
    PatientController.updateIntoDB
);

router.delete(
    '/soft/:id',
    PatientController.softDelete
);

export const PatientRoutes = router;