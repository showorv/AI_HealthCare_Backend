import { Doctor, Prisma } from "@prisma/client"
import { IOptions, paginationHelper } from "../../helper/pagination"
import { doctorSearchableField } from "./doctor.constant"
import { prisma } from "../../shared/prisma"
import AppError from "../../AppErrors/AppError"
import { IDoctor, IDoctorFilterRequest, IDoctorUpdate } from "./doctor.interface"
import { askOpenRouter} from "../../helper/askOpenAi"
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage"
import { IPaginationOptions } from "../../interfaces/pagination"



const getAllFromDB = async ( fields: any, options: IOptions)=>{

    const {page,limit,sortBy,sortOrder,skip} = paginationHelper.calculatePagination(options)

    const {searchItem,specialist, ...filterData} = fields


    
    const andCondition: Prisma.DoctorWhereInput[]=[];

    if(searchItem){
        andCondition.push({
            OR: doctorSearchableField.map((item)=> ({
                [item]: {
                    contains: searchItem,
                    mode: "insensitive"
                }
            }))
        })
    }

    if(specialist && specialist.length > 0){
        const specialtiesArray = Array.isArray(specialist) ? specialist : [specialist];
        andCondition.push({
            doctorSpecialist: {
                some: {
                    specialities:{
                        title: {
                            in: specialtiesArray,
                            mode: 'insensitive'
                        }
                    }
                }
            }
        })
    }

    if(Object.keys(filterData).length > 0){

        const filterDoctor = Object.keys(filterData).map((field)=> ({
            [field]: {
                equals: (filterData as any)[field]
            }
        }))

        andCondition.push(...filterDoctor)
    }


    const whereConditions: Prisma.DoctorWhereInput = andCondition.length > 0 ? {
        AND: andCondition
    } : {}

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:{
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialist: {
                 include: {
                    specialities:{
                        select: {
                            title: true
                        }
                    }
                 }
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            },
            reviews: {
                select: {
                    rating: true,
                    comment: true
                }
            }
        }
    })

    const total = await prisma.doctor.count({
        where: whereConditions
    })


    return{
        metaData: {
            page,
            limit,
            total
        },
       data: result
    }

}
const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        doctorSpecialist: {
          include: {
            specialities: true,
          },
        },
        doctorSchedules: {
          include: {
            schedule: true
          }
        },
        reviews: true,
      },
    });
    return result;
  };

  const updateDoctor = async (id: string, payload: IDoctorUpdate) => {
    const { specialties, removeSpecialties, ...doctorData } = payload;
  
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
      where: {
        id,
        isDeleted: false,
      },
    });
  
    await prisma.$transaction(async (transactionClient) => {
      // Step 1: Update doctor basic data
      if (Object.keys(doctorData).length > 0) {
        await transactionClient.doctor.update({
          where: {
            id,
          },
          data: doctorData,
        });
      }
  
      // Step 2: Remove specialties if provided
      if (
        removeSpecialties &&
        Array.isArray(removeSpecialties) &&
        removeSpecialties.length > 0
      ) {
        // Validate that specialties to remove exist for this doctor
        const existingDoctorSpecialties =
          await transactionClient.doctorSpecialties.findMany({
            where: {
              doctorId: doctorInfo.id,
              specialitiesId: {
                in: removeSpecialties,
              },
            },
          });
  
        if (existingDoctorSpecialties.length !== removeSpecialties.length) {
          const foundIds = existingDoctorSpecialties.map(
            (ds) => ds.specialitiesId
          );
          const notFound = removeSpecialties.filter(
            (id) => !foundIds.includes(id)
          );
          throw new Error(
            `Cannot remove non-existent specialties: ${notFound.join(", ")}`
          );
        }
  
        // Delete the specialties
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: {
              in: removeSpecialties,
            },
          },
        });
      }
  
      // Step 3: Add new specialties if provided
      if (specialties && Array.isArray(specialties) && specialties.length > 0) {
        // Verify all specialties exist in Specialties table
        const existingSpecialties = await transactionClient.specialties.findMany({
          where: {
            id: {
              in: specialties,
            },
          },
          select: {
            id: true,
          },
        });
  
        const existingSpecialtyIds = existingSpecialties.map((s) => s.id);
        const invalidSpecialties = specialties.filter(
          (id) => !existingSpecialtyIds.includes(id)
        );
  
        if (invalidSpecialties.length > 0) {
          throw new Error(
            `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
          );
        }
  
        // Check for duplicates - don't add specialties that already exist
        const currentDoctorSpecialties =
          await transactionClient.doctorSpecialties.findMany({
            where: {
              doctorId: doctorInfo.id,
              specialitiesId: {
                in: specialties,
              },
            },
            select: {
              specialitiesId: true,
            },
          });
  
        const currentSpecialtyIds = currentDoctorSpecialties.map(
          (ds) => ds.specialitiesId
        );
        const newSpecialties = specialties.filter(
          (id) => !currentSpecialtyIds.includes(id)
        );
  
        // Only create new specialties that don't already exist
        if (newSpecialties.length > 0) {
          const doctorSpecialtiesData = newSpecialties.map((specialtyId) => ({
            doctorId: doctorInfo.id,
            specialitiesId: specialtyId,
          }));
  
          await transactionClient.doctorSpecialties.createMany({
            data: doctorSpecialtiesData,
          });
        }
      }
    });
  
    // Step 4: Return updated doctor with specialties
    const result = await prisma.doctor.findUnique({
      where: {
        id: doctorInfo.id,
      },
      include: {
        doctorSpecialist: {
          include: {
            specialities: true,
          },
        },
      },
    });
  
    return result;
  };

// const getAiSuggestion = async (payload: {symptoms: string})=>{

//     if(!(payload && payload.symptoms)){
//         throw new AppError(400,"symptoms is required")
//     }


//     const doctors = await prisma.doctor.findMany({
//         where: {isDeleted: false},
//         include: {
//             doctorSpecialist: {
//                 include: {
//                     specialities: true
//                 }
//             }
//         }
//     })

//     const prompt = `
//     You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
//     Each doctor has specialties and years of experience.
//     Only suggest doctors who are relevant to the given symptoms.
    
//     Symptoms: ${payload.symptoms}
    
//     Here is the doctor list (in JSON):
//     ${JSON.stringify(doctors, null, 2)}
    
//     Return your response in JSON format with full individual doctor data and  the reason of why the doctor is fit for the symptoms. 
//     `;
    
//         console.log("analyzing......\n")
//         const completion = await openai.chat.completions.create({
//             model: 'z-ai/glm-4.5-air:free',
//             messages: [
//                 {
//                     role: "system",
//                     content:
//                         "You are a helpful AI medical assistant that provides doctor suggestions.",
//                 },
//                 {
//                     role: 'user',
//                     content: prompt,
//                 },
//             ],
//         });
    
//     //    console.log(completion.choices[0].message);
//        const result = await extractJsonFromMessage(completion.choices[0].message)
//        return result;
       
//     }

    
const getAiSuggestion = async (input: any) => {
    // Fetch all active doctors with their specialties and ratings
    const doctors = await prisma.doctor.findMany({
      where: { isDeleted: false },
      include: {
        doctorSpecialist: {
          include: { specialities: true },
        },
        reviews: { select: { rating: true } },
      },
    });
  
    if (doctors.length === 0) {
      return [];
    }
  
    // Transform doctors data to include calculated average ratings and all specialties
    const doctorsWithRatings = doctors.map((doctor: any) => {
      const allSpecialties = doctor.doctorSpecialties
        .map((ds: any) => ds.specialities?.title)
        .filter(Boolean);
  
      return {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        profilePhoto: doctor.profilePhoto,
        contactNumber: doctor.contactNumber,
        address: doctor.address,
        registrationNumber: doctor.registrationNumber,
        experience: doctor.experience,
        gender: doctor.gender,
        appointmentFee: doctor.appointmentFee,
        qualification: doctor.qualification,
        currentWorkingPlace: doctor.currentWorkingPlace,
        designation: doctor.designation,
        averageRating: doctor.review && doctor.review.length > 0
          ? doctor.review.reduce((sum: number, r: any) => sum + r.rating, 0) / doctor.review.length
          : 0,
        specialties: allSpecialties, // Array of all specialties
        primarySpecialty: allSpecialties[0] || 'General', // For backward compatibility
      };
    });
  
    const systemMessage = {
      role: "system",
      content:
        "You are an expert medical recommendation assistant. Analyze patient symptoms and match them to the most appropriate medical specialty, then recommend suitable doctors. Be very precise in specialty matching - for example: headaches/brain issues → Neurology, chest pain/heart issues → Cardiology, kidney issues → Nephrology, etc.",
    };
  
    const userMessage = {
      role: "user",
      content: `
  Patient Symptoms: ${input.symptoms}
  
  Available Doctors (JSON):
  ${JSON.stringify(doctorsWithRatings, null, 2)}
  
  CRITICAL INSTRUCTIONS:
  1. Carefully analyze the symptoms: "${input.symptoms}"
  2. Determine the MOST RELEVANT medical specialty for these specific symptoms
  3. Match ALL doctors whose specialties array contains the relevant specialty
  4. A doctor may have multiple specialties - check ALL of them in the "specialties" array
  5. Return ALL doctors that have a matching specialty (e.g., if 2 doctors have Neurology, return both)
  6. When returning results, include ALL specialties for each doctor, with the MOST RELEVANT specialty FIRST in the array
     Example: If doctor has ["Nephrology", "Neurology"] and symptoms are "headache", return "specialties": ["Neurology", "Nephrology"]
  7. Prioritize by: Best specialty match > Highest rating > Most experience
  8. Return up to 10 doctors maximum (return ALL matching doctors if less than 10)
  9. Return ONLY a valid JSON array with these EXACT keys for each doctor:
     - id, name, specialties (array with MATCHED specialty first), experience, averageRating, 
       appointmentFee, qualification, designation, currentWorkingPlace, profilePhoto
  
  Example format:
  [
    {
      "id": "doctor-id-1",
      "name": "Dr. Name 1",
      "specialties": ["Neurology", "Nephrology"],
      "experience": 5,
      "averageRating": 4.5,
      "appointmentFee": 2000,
      "qualification": "MBBS, MD",
      "designation": "Consultant",
      "currentWorkingPlace": "Hospital",
      "profilePhoto": "url or null"
    },
    {
      "id": "doctor-id-2",
      "name": "Dr. Name 2",
      "specialties": ["Neurology"],
      "experience": 8,
      "averageRating": 4.8,
      "appointmentFee": 2500,
      "qualification": "MBBS, MD, DM",
      "designation": "Senior Consultant",
      "currentWorkingPlace": "Medical Center",
      "profilePhoto": "url or null"
    }
  ]
  
  RESPOND WITH ONLY THE JSON ARRAY - NO EXPLANATIONS, NO MARKDOWN, NO EXTRA TEXT.
  `,
    };
  
    try {
      const response = await askOpenRouter([systemMessage, userMessage]);
  
      // Clean the response to extract JSON
      const cleanedJson = response
        .replace(/```(?:json)?\s*/g, "") // remove ``` or ```json
        .replace(/```$/g, "") // remove ending ```
        .trim();
  
      const suggestedDoctors = JSON.parse(cleanedJson);
  
      // Validate that response is an array
      if (!Array.isArray(suggestedDoctors)) {
        console.error('AI response is not an array:', suggestedDoctors);
        return [];
      }
  
      return suggestedDoctors;
    } catch (error) {
      console.error('Error parsing AI suggestion response:', error);
      // Fallback: return top-rated doctors with proper format
      return doctorsWithRatings
        .sort((a: any, b: any) => b.averageRating - a.averageRating)
        .slice(0, 5)
        .map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.primarySpecialty,
          experience: doctor.experience,
          averageRating: doctor.averageRating,
          appointmentFee: doctor.appointmentFee,
          qualification: doctor.qualification,
          designation: doctor.designation,
          currentWorkingPlace: doctor.currentWorkingPlace,
          profilePhoto: doctor.profilePhoto,
        }));
    }
  };
  const getAllPublic = async (
    filters: IDoctorFilterRequest,
    options: IPaginationOptions
  ) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;
  
    const andConditions: Prisma.DoctorWhereInput[] = [];
  
    if (searchTerm) {
      andConditions.push({
        OR: doctorSearchableField.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      });
    }
  
    // Handle multiple specialties: ?specialties=Cardiology&specialties=Neurology
    if (specialties && specialties.length > 0) {
      // Convert to array if single string
      const specialtiesArray = Array.isArray(specialties) ? specialties : [specialties];
  
      andConditions.push({
        doctorSpecialist: {
          some: {
            specialities: {
              title: {
                in: specialtiesArray,
                mode: "insensitive",
              },
            },
          },
        },
      });
    }
  
    if (Object.keys(filterData).length > 0) {
      const filterConditions = Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      }));
      andConditions.push(...filterConditions);
    }
  
    andConditions.push({
      isDeleted: false,
    });
  
    const whereConditions: Prisma.DoctorWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};
  
    const result = await prisma.doctor.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : { averageRating: "desc" },
      select: {
        id: true,
        name: true,
        // email: false, // Hide email in public API
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
        createdAt: true,
        updatedAt: true,
        doctorSpecialist: {
          include: {
            specialities: true,
          },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            patient: {
              select: {
                name: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });
  
    const total = await prisma.doctor.count({
      where: whereConditions,
    });
  
    return {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };
  };
  const deleteFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
      const deleteDoctor = await transactionClient.doctor.delete({
        where: {
          id,
        },
      });
  
      await transactionClient.user.delete({
        where: {
          email: deleteDoctor.email,
        },
      });
  
      return deleteDoctor;
    });
  };
export const doctorService = {getAllFromDB,getByIdFromDB, updateDoctor,getAiSuggestion,getAllPublic,deleteFromDB}