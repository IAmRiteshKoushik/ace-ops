import { z } from "zod";

export const EditAdminValidator = z.object({
    firstName : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/),
    lastName : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/),
    email : z.string().email().min(5),
    department : z.string(),
    role: z.enum(['Student', 'Faculty']).optional(),
    isActive: z.boolean().optional()
})