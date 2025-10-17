import { Gender } from "@prisma/client";

export interface IDoctor {
    name: string;
    email: string;
    contactNumber: string;
    currentWorkingPlace: string;
    id: string;
    profilePhoto: string | null;
    address: string;
    registrationNumber: string;
    experience: number;
    gender :   Gender
    appointmentFee: number
    qualification: string
   
    designation : string
    isDeleted  :boolean
    
    specialities: {
        specialistIds: string
        isDeleted?: boolean
    }[]
}