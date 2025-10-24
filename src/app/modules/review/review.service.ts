import AppError from "../../AppErrors/AppError"
import { prisma } from "../../shared/prisma"
import { IJwtPayload } from "../../types/common"


const createReview = async(user: IJwtPayload, payload: {appointmentId: string, rating: number, comment?:string})=>{

        const paitentData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user.email
            }
        })

        const appointmentData = await prisma.appointment.findUniqueOrThrow({
            where: {
                id: payload.appointmentId
            }
        })

        if(paitentData.id !== appointmentData.paitentId){
            throw new AppError(401, "thats not your appointment")
        }

        const result = await prisma.$transaction(async(tnx)=> {

            const create = await tnx.review.create({
                data: {
                    patientId: paitentData.id,
                    doctorId: appointmentData.doctorId,
                    appointmentId: appointmentData.id,
                    rating: payload.rating,
                    comment: payload.comment
                }
            })

            const avgRating = await tnx.review.aggregate({
                _avg: {
                    rating: true
                },
                where: {
                    doctorId: appointmentData.doctorId
                }
            })

            await tnx.doctor.update({
                where: {
                    id: appointmentData.doctorId
                },
                data: {
                    averageRating: avgRating._avg.rating as number
                }
            })

            return create
        })

        return result
}


export const reviewService = {createReview}