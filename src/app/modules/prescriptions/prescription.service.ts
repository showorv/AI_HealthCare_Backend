import { AppointmentStatus, PaymentStatus, Prescription, UserRole } from "@prisma/client";

import { prisma } from "../../shared/prisma";

import httpStatus from 'http-status'
import { IJwtPayload } from "../../types/common";
import AppError from "../../AppErrors/AppError";
import { IOptions, paginationHelper } from "../../helper/pagination";

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

const patientPrescription = async (user: IJwtPayload, options: IOptions) => {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

    const result = await prisma.prescription.findMany({
        where: {
            paitent: {
                email: user.email
            }
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctor: true,
            paitent: true,
            appointment: true
        }
    })

    const total = await prisma.prescription.count({
        where: {
            paitent: {
                email: user.email
            }
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }

};
export const PrescriptionService = {
    createPrescription,
    patientPrescription
}