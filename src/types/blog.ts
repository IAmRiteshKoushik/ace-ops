import { z } from "zod";

export const UpdateBlogValidator = z.object({
    title : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/),
    displayURL : z.string().url().optional(),
    blurb : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/).optional(),
    content : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/).optional(),
    author : z.string().trim().min(3).regex(/^[a-zA-Z0-9_ ]+$/).optional(),
    tags : z.array(z.string()),
    status : z.enum(["Draft", "Published"]).default("Draft").optional(),
    publishedOn : z.coerce.date().optional()
})