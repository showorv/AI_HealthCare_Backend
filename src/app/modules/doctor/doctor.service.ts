import { Doctor, Prisma } from "@prisma/client"
import { IOptions, paginationHelper } from "../../helper/pagination"
import { doctorSearchableField } from "./doctor.constant"
import { prisma } from "../../shared/prisma"
import AppError from "../../AppErrors/AppError"
import { IDoctor } from "./doctor.interface"



const getAllFromDB = async ( fields: any, options: IOptions)=>{

    const {page,limit,sortBy,sortOrder,skip} = paginationHelper.calculatePagination(options)

    const {searchItem,specialist, ...filterData} = fields


    
    const andCondition: Prisma.DoctorWhereInput[]=[];

    if(searchItem){
        andCondition.push({
            OR: doctorSearchableField.map((item)=> ({
                [item]: {
                    contains: searchItem,
                    mode: "insensitive"
                }
            }))
        })
    }

    if(specialist && specialist.length > 0){
        andCondition.push({
            doctorSpecialist: {
                some: {
                    specialities:{
                        title: {
                            contains: specialist,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        })
    }

    if(Object.keys(filterData).length > 0){

        const filterDoctor = Object.keys(filterData).map((field)=> ({
            [field]: {
                equals: (filterData as any)[field]
            }
        }))

        andCondition.push(...filterDoctor)
    }


    const whereConditions: Prisma.DoctorWhereInput = andCondition.length > 0 ? {
        AND: andCondition
    } : {}

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:{
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialist: {
                 include: {
                    specialities: true
                 }
            }
        }
    })

    const total = await prisma.doctor.count({
        where: whereConditions
    })


    return{
        metaData: {
            page,
            limit,
            total
        },
       data: result
    }

}


const updateDoctor = async (id: string, payload: Partial<IDoctor>)=>{

    const doctor = await prisma.doctor.findFirst({
        where: {
            id: id
        }
    })

    if(!doctor){
        throw new AppError(400, "doctor not found")
    }


    const {specialities, ...doctorData} = payload

    return await prisma.$transaction(async (tnx)=> {
        if(specialities && specialities.length > 0){

            const deletedSpecialist = specialities.filter((speciality)=> speciality.isDeleted)
        
            for( const specialist of deletedSpecialist){
        
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialist.specialistIds
                    }
                })
            }
            const createdSpecialist = specialities.filter((speciality)=> !speciality.isDeleted)
        
            for( const specialist of createdSpecialist){
        
                await tnx.doctorSpecialties.create({
                    data: {
                        doctorId: id,
                        specialitiesId: specialist.specialistIds
                    }
                })
            }
           }
            const updatedDoctor = await tnx.doctor.update({
                where: {
                    id: doctor.id
                },
                data: doctorData,
                include: {
                    doctorSpecialist:{
                        include: {
                            specialities: true
                        }
                    }
                    
                }
            })
        
            return updatedDoctor
    })


}

export const doctorService = {getAllFromDB, updateDoctor}