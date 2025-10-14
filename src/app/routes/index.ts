import express from 'express';
import { userRouter } from '../modules/users/user.route';
import { authRouter } from '../modules/auth/auth.route';
import { scheduleRouter } from '../modules/schedules/schedule.route';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRouter
    },
    {
        path: '/auth',
        route: authRouter
    },
    {
        path: '/schedule',
        route: scheduleRouter
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;