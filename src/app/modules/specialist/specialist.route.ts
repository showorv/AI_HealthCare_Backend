import express, { NextFunction, Request, Response } from 'express';


import { UserRole } from '@prisma/client';
import { fileUploader } from '../../helper/fileUploader';
import { SpecialtiesController } from './specialist.controller';
import { SpecialtiesValidtaion } from './specialist.validation';
import checkAuth from '../../helper/checkAuth';


const router = express.Router();



router.get(
    '/',
    SpecialtiesController.getAllFromDB
);

router.post(
    '/create',
    checkAuth(UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data))
        return SpecialtiesController.inserIntoDB(req, res, next)
    }
);



// Task 2: Delete Specialties Data by ID

/**
- Develop an API endpoint to delete specialties by ID.
- Implement an HTTP DELETE endpoint accepting the specialty ID.
- Delete the specialty from the database and return a success message.
- ENDPOINT: /specialties/:id
*/

router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    SpecialtiesController.deleteFromDB
);

export const SpecialtiesRoutes = router;