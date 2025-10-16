import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import { IUser } from "../users/user.interface"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { jwtHelper } from "../../helper/generateToken"
import config from "../../../config"
import AppError from "../../AppErrors/AppError"

const login = async( payload: Partial<IUser>)=>{

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    if(!user){
        throw new Error("email not found")
    }

    const isPassMatch = await bcrypt.compare(payload.password as string, user.password)

    if(!isPassMatch){
        throw new AppError(400,"invalid crediential")
    }


    const accessToken = jwtHelper.generateToken({email: user.email, role: user.role}, config.jwt.JWT_SECRET as string, config.jwt.JWT_EXPIRES as string)
    const refreshToken = jwtHelper.generateToken({email: user.email, role: user.role},  config.jwt.JWT_REFRESHSECRET as string, config.jwt.JWT_REFRESHEXPIRES as string)

    return{
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }
}


export const authService = {login}