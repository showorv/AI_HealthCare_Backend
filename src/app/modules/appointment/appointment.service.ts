import { stripe } from "../../helper/stripe";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common"
import { v4 as uuidv4 } from 'uuid';

const createAppointment = async (user: IJwtPayload, payload: {doctorId: string, scheduleId: string})=>{

    const paitentData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })

    const isBookedOrNot = await prisma.doctorSchedule.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })

    const videoCallindId = uuidv4()

    const transactionId = uuidv4()

    const result = await prisma.$transaction(async(tnx)=>{

        const appointmentData = await tnx.appointment.create({
            data: {
                paitentId: paitentData.id,
                doctorId: doctorData.id,
                scheduleId: isBookedOrNot.scheduleId,
                videoCallingId: videoCallindId
            }
        })
        
        await tnx.doctorSchedule.update({
            where:{
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: isBookedOrNot.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })
        
      const paymentData=  await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `https://www.programming-hero.com/`,
            cancel_url: `https://next.programming-hero.com/`,
        });

        return { paymentUrl: session.url };

        // console.log(session);
        

        // return appointmentData

    })

    return result



    // console.log({paitentId: paitentData.id, doctorId: doctorData.id, scheduleId: isBookedOrNot.scheduleId, videoCallindId});
    

}

export const appointmentService = {createAppointment}