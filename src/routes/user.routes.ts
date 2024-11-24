import { Router } from "express";
import { GetAllBlogsHandlerForUser, GetBlogByIdHandler } from "@/controllers/user/blog";

const router = Router();

// router.post("/login", handleLogin);
// router.post("/register", handleRegistration);
// router.post("/register/otp", handleOTPVerification);

//Blogs
router.get("/blogs", GetAllBlogsHandlerForUser);
router.get("/blogs/:blogId", GetBlogByIdHandler);
//
// router.get("/newsletter",)
// router.get("/blog/:newsletterId",)

export default router;
