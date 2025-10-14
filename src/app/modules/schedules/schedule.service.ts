/*
 admin create schedule slots. 
 like 10.10.2026 -> startDateTime: 10.00 & endDateTime 12.00 & every slot is for 30mints. 10.00->10.30 
 then doctor with their id take slot by scheduleId and paitent book slot.

 */

 import {addHours,addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/pagination";
import { Prisma } from "@prisma/client";
import { IJwtPayload } from "../../types/common";
const createSchedule = async (payload: any)=>{

    const {startDate, endDate, startTime, endTime} = payload

    const interval = 30 //30mits
    const schedules = []


    const currentDate = new Date(startDate)
    const lastDate = new Date(endDate)

    while(currentDate <= lastDate){

        const startDateTime = new Date (
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0]) //11:30
                ),
                Number(startTime.split("")[1])
            )
           
        )

        const endDateTime = new Date (
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0]) //11:30
                ),
                Number(endTime.split("")[1])
            )
           
        )

        // divide the slot 

        while(startDateTime < endDateTime){

            const slotStartDateTime = startDateTime // 10:00
            const slotEndDateTime = addMinutes(startDateTime, interval) // 10;30

            const scheduleData = {
                startDateTime: slotStartDateTime,
                endDateTime: slotEndDateTime
            }

            
            const exisitingSchedule = await prisma.schedule.findFirst({
                where: scheduleData
            })

            if(!exisitingSchedule){
                const result = await prisma.schedule.create({
                    data: scheduleData
                })

                schedules.push(result)
            }

            // slotStartDateTime = slotEndDateTime 
            //iterate the time 
            slotStartDateTime.setMinutes(slotStartDateTime.getMinutes() + interval)
        }

        // iterate the date

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return schedules

}


const getScheduleForDoctor = async (user:IJwtPayload, filtering: any, options: IOptions)=>{

    const {page,limit, sortBy,sortOrder,skip} = paginationHelper.calculatePagination(options)

    const {startDateTime: filterStartDateTime, endDateTime: filterEndDateTime} = filtering

    const andCondition: Prisma.ScheduleWhereInput[] = []

    if(filterStartDateTime && filterEndDateTime){
     andCondition.push({
        AND: [
            {
            startDateTime: {
                gte: filterStartDateTime
            }
        },
            {
            endDateTime: {
                lte: filterEndDateTime
            }
        },
    ]
     })
    }

    const whereConditions: Prisma.ScheduleWhereInput = andCondition.length > 0 ? {
        AND: andCondition
    } : {}

    const doctorSchedule = await prisma.doctorSchedule.findMany({
        where: {
            doctor: {
                email: user.email
            }
        },
        select: {
            scheduleId: true
        }
    })

   

    const doctorSchedulesIds = doctorSchedule.map((scheduleId => scheduleId.scheduleId))
    
    const result = await prisma.schedule.findMany({
        where:
        {
            ...whereConditions,
            id: {
                notIn: doctorSchedulesIds
            }
        } ,
        skip,
        take: limit,

        orderBy: {
            [sortBy]: sortOrder
        }
    })

    const total= await prisma.schedule.count({
        where:   {
            ...whereConditions,
            id: {
                notIn: doctorSchedulesIds
            }
        }
    })

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    }


}


const deleteSchedule = async (id: string)=>{

    const result = await prisma.schedule.delete({
        where:{
            id
        }
    })

    return result
}
export const scheduleService = {createSchedule, getScheduleForDoctor,deleteSchedule}