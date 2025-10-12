import z from "zod";


const paitentValidationSchema = z.object({
    password: z.string(),
    paitent: z.object({
        name: z.string().nonempty("Name is required"),
        email: z.string().nonempty("Email is required")
    })
})


export const userValidation = {
    paitentValidationSchema
}