import { Request } from "express"
import config from "../../../config"
import { prisma } from "../../shared/prisma"
import { IUser } from "./user.interface"
import bcrypt from "bcrypt"
import { fileUploader } from "../../helper/fileUploader"
import { Doctor, UserRole } from "@prisma/client"

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


const getAll = async ( {page, limit}: {page: number, limit:number})=>{

    const skip = (page-1) * limit

    console.log(page,limit);
    

    const result = await prisma.user.findMany({
        skip,
        take: limit
    })

    return result
}

export const userService = {createPaitent,createAdmin,createDoctor, getAll}