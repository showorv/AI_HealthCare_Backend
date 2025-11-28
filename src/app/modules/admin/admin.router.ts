import express from 'express';
import { AdminController } from './admin.controller';



import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validate';
import { adminValidationSchemas } from './admin.validation';
import checkAuth from '../../helper/checkAuth';

const router = express.Router();

router.get(
    '/',
    checkAuth(UserRole.ADMIN),
    AdminController.getAllFromDB
);

router.get(
    '/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.getByIdFromDB
);

router.patch(
    '/:id',
    checkAuth(UserRole.ADMIN),
    validateRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);

router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.deleteFromDB
);

router.delete(
    '/soft/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.softDeleteFromDB
);

export const AdminRoutes = router;