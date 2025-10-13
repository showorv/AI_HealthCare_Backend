import { Request } from "express"
import config from "../../../config"
import { prisma } from "../../shared/prisma"
import { IUser } from "./user.interface"
import bcrypt from "bcrypt"
import { fileUploader } from "../../helper/fileUploader"
import { Doctor, Prisma, UserRole } from "@prisma/client"
import pick from "../../helper/filtering"
import { IOptions, paginationHelper } from "../../helper/pagination"
import { searchableItem } from "./user.constant"

const createPaitent = async (req: Request)=>{

    if(req.file){

      const uploadResult= await fileUploader.uploadToCloudinary(req.file)

      req.body.paitent.profilePhoto = uploadResult?.secure_url

      console.log({uploadResult});
      
       
        

    }

    const hashPassword = await bcrypt.hash(req.body.password,Number(config.hash_salt))

    const result = await prisma.$transaction(async (tnx)=>{

        await tnx.user.create({
            data: {
                email: req.body.paitent.email,
                password: hashPassword
            }
        })

        return await tnx.patient.create({
            data: req.body.paitent
        })
    })

    return result


}


const createAdmin = async (req: Request)=>{

    const file = req.file

    if(file){
        const uploadResult= await fileUploader.uploadToCloudinary(file)

        req.body.admin.profilePhoto = uploadResult?.secure_url
  
    }

    const hashPassword = await bcrypt.hash(req.body.password,Number(config.hash_salt))


    const userData = {
        email: req.body.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN
    }

    const result = await prisma.$transaction(async(tnx)=> {

        await tnx.user.create({
            data: userData
        })

        const createdAdmin = await tnx.admin.create({
            data: req.body.admin
        })
        return createdAdmin
    })

    return result

}

const createDoctor = async (req: Request): Promise<Doctor> => {

    const file = req.file;

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url
    }
    const hashedPassword: string = await bcrypt.hash(req.body.password, 10)

    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR
    }

    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData
        });

        const createdDoctorData = await transactionClient.doctor.create({
            data: req.body.doctor
        });

        return createdDoctorData;
    });

    return result;
};


// const getAll = async ( {page, limit, searchItem, sortBy, sortOrder, role,status}: {page: number, limit:number, searchItem?:any, sortBy: any, sortOrder: any, role: any, status: any})=>{


//     // for dynamic 


//     const pageNumber = page || 1
//     const limitNumber = limit || 5

//     const skip = (pageNumber-1) * limitNumber


    

//     const result = await prisma.user.findMany({
//         skip,
//         take: limitNumber,

//         where: {
//             email: {
//                 contains: searchItem,
//                 mode: "insensitive"
//             },
//             role: role,
//             status: status
//         },

//         orderBy: sortBy && sortOrder ? 
//         {[sortBy]: sortOrder}: {createdAt: "desc"}
//     })

//     return result
// }

const getAll = async (params:any, options: IOptions)=>{


    // for dynamic 

    const {page,limit, sortBy,sortOrder,skip} = paginationHelper.calculatePagination(options)

    const { searchItem, ...filterData} = params

    const andCondition: Prisma.UserWhereInput[] = []

    if(searchItem){

        // OR: ["email,name,role"].map

        andCondition.push({
            OR: searchableItem.map((item)=> ({
                [item]: {
                    contains: searchItem,
                    mode: "insensitive"
                }
            }))
        })
       
    }

    if(Object.keys(filterData).length > 0){

        andCondition.push({
            AND: Object.keys(filterData).map((field)=> ({
                [field]: {
                    equals: (filterData as any)[field]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andCondition.length > 0 ? {
        AND: andCondition
    } : {}


    const result = await prisma.user.findMany({
        skip,
        take: limit,

        // where: {
        //     AND: andCondition
        // },
        where: whereConditions,


        orderBy: {[sortBy]: sortOrder}
    
    }
    )

    const total = await prisma.user.count({
        where: whereConditions
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

export const userService = {createPaitent,createAdmin,createDoctor, getAll}