import { AppointmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client";

import { prisma } from "../../shared/prisma";

import httpStatus from 'http-status'
import { IJwtPayload } from "../../types/common";
import AppError from "../../AppErrors/AppError";

const createPrescription = async (user: IJwtPayload, payload: Partial<Prescription>) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID
        },
        include: {
            doctor: true
        }
    })

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    const result = await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            paitentId: appointmentData.paitentId,
            instruction: payload.instruction as string,
            followUpDate: payload.followUpDate || null
        },
        include: {
            paitent: true
        }
    });

    return result;
}

// get my prescription as a patient

export const PrescriptionService = {
    createPrescription
}