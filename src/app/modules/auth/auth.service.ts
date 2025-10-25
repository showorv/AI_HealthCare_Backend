import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import { IUser } from "../users/user.interface"
import bcrypt from "bcrypt"
import jwt, { Secret } from "jsonwebtoken"
import { jwtHelper } from "../../helper/generateToken"
import config from "../../../config"
import AppError from "../../AppErrors/AppError"
import { IJwtPayload } from "../../types/common"
import httpStatus from "http-status"
import emailSender from "./EmailSender"
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

const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelper.verifiedToken(token, config.jwt.JWT_REFRESHSECRET as Secret);
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });

    const accessToken = jwtHelper.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt.JWT_SECRET as Secret,
        config.jwt.JWT_EXPIRES as string
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange
    };

};

const changePassword = async (user: IJwtPayload, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        }
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
        throw new Error("Password incorrect!")
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(config.hash_salt));

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

    return {
        message: "Password changed successfully!"
    }
};

const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    const resetPassToken = jwtHelper.generateToken(
        { email: userData.email, role: userData.role },
        config.RESET_PASS_SECRET as Secret,
        config.RESET_PASS_EXPIRY as string
    )

    const resetPassLink = config.RESET_PASS_LINK + `?userId=${userData.id}&token=${resetPassToken}`

    await emailSender(
        userData.email,
        `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>

        </div>
        `
    )
};

const resetPassword = async (token: string, payload: { id: string, password: string }) => {

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: UserStatus.ACTIVE
        }
    });

    const isValidToken = jwtHelper.verifiedToken(token, config.RESET_PASS_SECRET as Secret)

    if (!isValidToken) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden!")
    }

    // hash password
    const password = await bcrypt.hash(payload.password, Number(config.hash_salt));

    // update into database
    await prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    })
};

const getMe = async (session: any) => {
    const accessToken = session.accessToken;
    const decodedData = jwtHelper.verifiedToken(accessToken, config.jwt.JWT_SECRET as Secret);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    })

    const { id, email, role, needPasswordChange, status } = userData;

    return {
        id,
        email,
        role,
        needPasswordChange,
        status
    }

}


export const authService = {login, changePassword,
    forgotPassword,
    refreshToken,
    resetPassword,
    getMe}