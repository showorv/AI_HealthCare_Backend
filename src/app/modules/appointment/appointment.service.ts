import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/pagination";
import { stripe } from "../../helper/stripe";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common"
import { v4 as uuidv4 } from 'uuid';
import AppError from "../../AppErrors/AppError";

const createAppointment = async (user: IJwtPayload, payload: {doctorId: string, scheduleId: string})=>{

    const paitentData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })

    const isBookedOrNot = await prisma.doctorSchedule.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })

    const videoCallindId = uuidv4()

    const transactionId = uuidv4()

    const result = await prisma.$transaction(async(tnx)=>{

        const appointmentData = await tnx.appointment.create({
            data: {
                paitentId: paitentData.id,
                doctorId: doctorData.id,
                scheduleId: isBookedOrNot.scheduleId,
                videoCallingId: videoCallindId
            }
        })
        
        await tnx.doctorSchedule.update({
            where:{
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: isBookedOrNot.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })
        
      const paymentData=  await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `https://www.programming-hero.com/`,
            cancel_url: `https://next.programming-hero.com/`,
        });

        return { paymentUrl: session.url };

        // console.log(session);
        

        // return appointmentData

    })

    return result



    // console.log({paitentId: paitentData.id, doctorId: doctorData.id, scheduleId: isBookedOrNot.scheduleId, videoCallindId});
    

}


const getAppointment = async (user: IJwtPayload, filters:any, options: IOptions)=>{

    const {page,limit,skip,sortBy,sortOrder} = paginationHelper.calculatePagination(options)

    const {...filterData} = filters

    const andCondition:Prisma.AppointmentWhereInput[] = []

    if(user.role === UserRole.DOCTOR){
        andCondition.push({
            doctor: {
                email: user.email
            }
        })
    }else if(user.role === UserRole.PATIENT){
        andCondition.push({
            paitent: {
                email: user.email
            }
        })
    }

    if(Object.keys(filterData).length> 0){
        const filterConditions = Object.keys(filterData).map((filter)=> ({
            [filter]: {
                equals: (filterData as any)[filter]
            }
        }))

        andCondition.push(...filterConditions)
    }

    const whereConditions: Prisma.AppointmentWhereInput = andCondition.length > 0 ? {AND: andCondition}: {}

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: user.role === UserRole.PATIENT ? 
        {
            doctor: true
        }: {paitent: true}
    })

    const total = await prisma.appointment.count({
        where: whereConditions
    })

    return {
        metaData: {
            page,
            limit,
            total
        },
        data: result
    }

}

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: IJwtPayload)=>{

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where:{
            id: appointmentId
        },
        include: {
            doctor: true
        }
    })

    if(user.role === UserRole.DOCTOR){
        if(!(user.email === appointmentData.doctor.email)){
            throw new AppError(401,"this is not your appointment")
        }
    }

    const result = await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    })

    return result
}

export const appointmentService = {createAppointment,getAppointment,updateAppointmentStatus}