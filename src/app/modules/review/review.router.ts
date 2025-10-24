import express, { NextFunction, Request, Response } from 'express';
import { reviewController } from './review.controller';
import checkAuth from '../../helper/checkAuth';
import { UserRole } from '@prisma/client';



const router = express.Router();

router.post("/",checkAuth(UserRole.PATIENT), reviewController.createReview)


export const reviewRouter = router;