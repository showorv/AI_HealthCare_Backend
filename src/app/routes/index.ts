import express from 'express';
import { userRouter } from '../modules/users/user.route';
import { authRouter } from '../modules/auth/auth.route';
import { scheduleRouter } from '../modules/schedules/schedule.route';
import { doctorScheduleRouter } from '../modules/doctorSchedule/doctor_schedule.route';
import { SpecialtiesRoutes } from '../modules/specialist/specialist.route';
import { doctorRouter } from '../modules/doctor/doctor.route';
import { appointmentRouter } from '../modules/appointment/appointment.route';
import { reviewRouter } from '../modules/review/review.router';
import { PatientRoutes } from '../modules/paitent/paitent.router';


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
    {
        path: '/specialist',
        route: SpecialtiesRoutes
    },
    {
        path: '/doctor',
        route: doctorRouter
    },
    {
        path: '/appointment',
        route: appointmentRouter
    },
    {
        path: '/review',
        route: reviewRouter
    },
    {
        path: '/paitent',
        route: PatientRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;