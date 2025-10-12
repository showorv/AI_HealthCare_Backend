import { Request } from "express"
import config from "../../../config"
import { prisma } from "../../shared/prisma"
import { IUser } from "./user.interface"
import bcrypt from "bcrypt"
import { fileUploader } from "../../helper/fileUploader"

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


export const userService = {createPaitent}