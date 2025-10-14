import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";


const createDoctorSchedule = async (user: IJwtPayload, payload: { schedulesIDs: string[]})=>{

   

    const doctor = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const doctorSchedulesData = payload.schedulesIDs.map((scheduleId)=>({
        doctorId: doctor.id,
        scheduleId
    }))


    const result = await prisma.doctorSchedule.createMany({
        data: doctorSchedulesData
    })


    return result
    
}

export const drScheduleService = {createDoctorSchedule}