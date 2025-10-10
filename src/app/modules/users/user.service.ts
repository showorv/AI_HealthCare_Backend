import config from "../../../config"
import { prisma } from "../../shared/prisma"
import { IUser } from "./user.interface"
import bcrypt from "bcrypt"

const createPaitent = async (payload: IUser)=>{

    const hashPassword = await bcrypt.hash(payload.password,Number(config.hash_salt))

    const result = await prisma.$transaction(async (tnx)=>{

        await tnx.user.create({
            data: {
                email: payload.email,
                password: payload.email
            }
        })

        return await tnx.patient.create({
            data: {
                name: payload.name,
                email: payload.email
            }
        })
    })

    return result


}


export const userService = {createPaitent}