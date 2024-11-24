import { prismaClient } from "@/main"
import { Request, Response } from "express";
import { z } from "zod";
import { UpdateBlogValidator } from "@/types/blog";

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

export const GetAllBlogsHandlerForAdmin = async (_ : Request, res : Response) => {
    try {
        const blogs = await prismaClient.blogs.findMany({
            select : {
                id : true,
                title : true,
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

export const UpdateBlogHandler = async (req : Request, res : Response) => {
    const validateBlog = UpdateBlogValidator.safeParse(req.body);
    if(!validateBlog.success){
        return res.status(400).json({
            message: "Invalid Blog data provided!"
          });
    }

    const blogId = z.string().cuid().safeParse(req.params.blogId)
    if(!blogId.success){
        return res.status(400).json({
            message: "Invalid Blog Id provided"
        });
    }

    const blog = await prismaClient.blogs.findFirst({
        where:{
            id : blogId.data
        }
    })
    if (!blog) {
        return res.status(404).json({
            message: "Blog not found!"
          })
    }
    
    try {
        const blog = await prismaClient.$transaction(async (tx) => {
            const updatedBlog = await tx.blogs.update({
                where:{
                    id : blogId.data
                },
                data:{
                    title : validateBlog.data.title,
                    displayURL : validateBlog.data.displayURL,
                    blurb : validateBlog.data.blurb,
                    content : validateBlog.data.content,
                    author : validateBlog.data.author,
                    tags : validateBlog.data.tags,
                    status : validateBlog.data.status,
                    publishedOn : validateBlog.data.publishedOn
                }
            });
            return updatedBlog;
        });
        return res.status(200).json({
            blog
        });
    }
    catch(e){
        return res.status(500).json({
            message: "Internal Server Error! Please try again later."
          });
    }
}

export const DeleteBlogHandler = async (req : Request, res : Response) => {
    const blogId = z.string().cuid().safeParse(req.params.blogId)
    if(!blogId.success){
        return res.status(400).json({
            message: "Invalid Blog Id provided"
        });
    }

    const blog = await prismaClient.blogs.findFirst({
        where:{
            id : blogId.data
        }
    })
    if (!blog) {
        return res.status(404).json({
            message: "Blog not found!"
          })
    }

    try{
        const blog = await prismaClient.$transaction(async (tx) => {
            const deletedBlog = await tx.blogs.delete({
                where:{
                    id : blogId.data
                }
            })
        })
        return res.status(200).json({
            message : "Blog deleted successfully"
        })
    }
    catch(e){
        return res.status(500).json({
            message: "Internal Server Error! Please try again later."
          });
    }
}

export const ChangeStatusOfBlog = async (req : Request, res : Response) => {
    const validStatus = z.enum(["Draft", "Published"]).safeParse(req.body.status);
    if(!validStatus.success){
        return res.status(400).json({
            message: "Invalid Blog data provided!"
          });
    }

    const blogId = z.string().cuid().safeParse(req.params.blogId)
    if(!blogId.success){
        return res.status(400).json({
            message: "Invalid Blog Id provided"
        });
    }

    try{
        const blog = await prismaClient.$transaction(async (tx) => {
            const changeStatusBlog = await tx.blogs.update({
                where:{
                    id : blogId.data
                },
                data:{
                    status : validStatus.data
                }
            })
        });
        return res.status(200).json({
            message : "Status updated successfully"
        });
    }
    catch(e){
        return res.status(500).json({
            message: "Internal Server Error! Please try again later."
          });
    }
}