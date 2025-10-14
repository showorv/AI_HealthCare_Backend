/*
 admin create schedule slots. 
 like 10.10.2026 -> startDateTime: 10.00 & endDateTime 12.00 & every slot is for 30mints. 10.00->10.30 
 then doctor with their id take slot by scheduleId and paitent book slot.

 */

 import {addHours,addMinutes, format } from "date-fns";
const createSchedule = async (payload: any)=>{

    const {startDate, endDate, startTime, endTime} = payload

    const interval = 30 //30mits
    const currentDate = new Date(startDate)
    const lastDate = new Date(endDate)

    while(currentDate <= lastDate){

        const startDateTime = new Date (
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-mm-dd")}`,
                    Number(startTime.split(":")[0]) //11:30
                ),
                Number(startTime.split("")[1])
            )
           
        )

        const endDateTime = new Date (
            addMinutes(
                addHours(
                    `${format(endDate, "yyyy-mm-dd")}`,
                    Number(endTime.split(":")[0]) //11:30
                ),
                Number(endTime.split("")[1])
            )
           
        )
    }

}

export const scheduleService = {createSchedule}