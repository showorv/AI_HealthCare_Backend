import express from 'express';
import { userRouter } from '../modules/users/user.route';
import { authRouter } from '../modules/auth/auth.route';
import { scheduleRouter } from '../modules/schedules/schedule.route';
import { doctorScheduleRouter } from '../modules/doctorSchedule/doctor_schedule.route';


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
    {
        path: '/dr-schedule',
        route: doctorScheduleRouter
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;