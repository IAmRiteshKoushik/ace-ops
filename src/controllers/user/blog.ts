import { prismaClient } from "@/main"
import { Request, Response } from "express";
import { z } from "zod";
import { UpdateBlogValidator } from "@/types/blog";

export const GetAllBlogsHandlerForUser = async (_ : Request, res : Response) => {
    try {
        const blogs = await prismaClient.blogs.findMany({
            select : {
                id : true,
                title : true,
                displayURL : true,
                blurb : true,
                content : true,
                author : true,
                tags : true,
                status : true,
                publishedOn : true
            }
        });
        return res.status(200).json({
            blogs
        });
    }
    catch(e){
        return res.status(500).json({
            message:"Internal Server Error! Please try again later."
        });
    }
}

export const GetBlogByIdHandler = async (req : Request, res : Response) => {
    const blogId = z.string().cuid().safeParse(req.params.blogId)
    if(!blogId.success){
        return res.status(400).json({
            message: "Invalid Blog Id provided"
        });
    }

    try{
        const blog = await prismaClient.blogs.findFirst({
            where:{
                id : blogId.data
            },
            select:{
                id : true,
                title : true,
                blurb : true,
                content : true,
                author : true,
                tags : true,
                status : true,
                publishedOn : true
            }
        })
        return res.status(200).json({
            blog
        });
    }
    catch(e){
        return res.status(500).json({
            message:"Internal Server Error! Please try again later."
        });
    }
}



