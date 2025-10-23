import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common"
import { v4 as uuidv4 } from 'uuid';

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
        
        await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        return appointmentData

    })

    return result



    // console.log({paitentId: paitentData.id, doctorId: doctorData.id, scheduleId: isBookedOrNot.scheduleId, videoCallindId});
    

}

export const appointmentService = {createAppointment}