import z from "zod";

const drScheduleZodValidation = z.object({
  body: z.object({
    schedulesIDs: z.array(z.string())
  })
})

export const doctorZodValidation = {drScheduleZodValidation}