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

// const forgotPassword = async (payload: { email: string }) => {
//     const userData = await prisma.user.findUniqueOrThrow({
//         where: {
//             email: payload.email,
//             status: UserStatus.ACTIVE
//         }
//     });

//     const resetPassToken = jwtHelper.generateToken(
//         { email: userData.email, role: userData.role },
//         config.RESET_PASS_SECRET as Secret,
//         config.RESET_PASS_EXPIRY as string
//     )

//     const resetPassLink = config.RESET_PASS_LINK + `?userId=${userData.id}&token=${resetPassToken}`

//     await emailSender(
//         userData.email,
//         `
//         <div>
//             <p>Dear User,</p>
//             <p>Your password reset link 
//                 <a href=${resetPassLink}>
//                     <button>
//                         Reset Password
//                     </button>
//                 </a>
//             </p>

//         </div>
//         `
//     )
// };

const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    const resetPassToken = jwtHelper.generateToken(
        { email: userData.email, userId: userData.id, role: userData.role },
        config.RESET_PASS_SECRET as Secret,
        config.RESET_PASS_EXPIRY as string
    )

    const resetPassLink = config.RESET_PASS_LINK + `?email=${encodeURIComponent(userData.email)}&token=${resetPassToken}`

    await emailSender(
        userData.email,
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">PH Health Care</h1>
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        Hello,
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 24px;">
                                        We received a request to reset your password for your PH Health Care account. Click the button below to create a new password:
                                    </p>
                                    <!-- Button -->
                                    <table role="presentation" style="margin: 0 auto;">
                                        <tr>
                                            <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                                <a href="${resetPassLink}" style="border: none; color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block; border-radius: 6px;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 20px;">
                                        Or copy and paste this link into your browser:
                                    </p>
                                    <p style="margin: 0 0 30px 0; color: #667eea; font-size: 14px; line-height: 20px; word-break: break-all;">
                                        ${resetPassLink}
                                    </p>
                                    <div style="border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 20px;">
                                            <strong>Security Notice:</strong>
                                        </p>
                                        <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #999999; font-size: 14px; line-height: 20px;">
                                            <li>This link will expire in 15 minutes</li>
                                            <li>If you didn't request this password reset, please ignore this email</li>
                                            <li>For security reasons, never share this link with anyone</li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                                        © ${new Date().getFullYear()} PH Health Care. All rights reserved.
                                    </p>
                                    <p style="margin: 0; color: #999999; font-size: 12px;">
                                        This is an automated email. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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

// const getMe = async (session: any) => {
//     const accessToken = session.accessToken;
//     const decodedData = jwtHelper.verifiedToken(accessToken, config.jwt.JWT_SECRET as Secret);

//     const userData = await prisma.user.findUniqueOrThrow({
//         where: {
//             email: decodedData.email,
//             status: UserStatus.ACTIVE
//         }
//     })

//     const { id, email, role, needPasswordChange, status } = userData;

//     return {
//         id,
//         email,
//         role,
//         needPasswordChange,
//         status
//     }

// }

const getMe = async (user: any) => {
    const accessToken = user.accessToken;
    const decodedData = jwtHelper.verifiedToken(accessToken, config.jwt.JWT_SECRET as Secret);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                }
            },
            doctor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    averageRating: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    doctorSpecialist: {
                        include: {
                            specialities: true
                        }
                    }
                }
            },
            patient: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    // contactNumber: true,
                    address: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    patientHealthDatas: true,
                }
            }
        }
    });

    return userData;
}


export const authService = {login, changePassword,
    forgotPassword,
    refreshToken,
    resetPassword,
    getMe}