import { AdminLoginHandler, GetAllAdminHandler, CreateAdminHandler, GetPastAdminHandler } from "@/controllers/admin/office";
import { Router } from "express";
import { validateToken } from "@/middleware/authentication/token";
import {
  GetAllEventsHandler,
  GetEventByIdHandler,
  CreateEventHandler,
  EditEventHandler,
} from "@/controllers/admin/event";
import { GetAllBlogsHandlerForAdmin, GetBlogByIdHandler, UpdateBlogHandler, DeleteBlogHandler, ChangeStatusOfBlog} from "@/controllers/admin/blogs";

const router = Router();

// Admin-Controls
router.post("/office/login", AdminLoginHandler);
// router.get("/office/dashboard", validateToken, AdminDashboardHandler);
router.get("/office", validateToken, GetAllAdminHandler);
router.get("/office/past", validateToken, GetPastAdminHandler);
router.post("/office/new", validateToken, CreateAdminHandler);
// router.post("/office/edit/{adminId}", validateToken, EditAdminHandler);

// Events
router.get("/events", validateToken, GetAllEventsHandler);
router.get("/events/:eventId", validateToken, GetEventByIdHandler);
router.post("/events/new", validateToken, CreateEventHandler);
router.post("/events/edit/:eventId", validateToken, EditEventHandler);

//Blogs
router.get("/blogs", validateToken, GetAllBlogsHandlerForAdmin);
router.get("/blogs/:blogId", validateToken, GetBlogByIdHandler);
router.post("/blogs/update/:blogId", validateToken, UpdateBlogHandler);
router.delete("/blogs/delete/:blogId", validateToken, DeleteBlogHandler);
router.put("/blogs/UpdateStatus/:blogId", validateToken, ChangeStatusOfBlog);

  
// Campaigns
// router.get("/campaigns", validateToken, handleGetAllCampaigns);
// router.get("/campaigns/:campaignId", validateToken, handleGetAllCampaigns);
// router.get("/campaigns/planned", validateToken, handleGetPlannedCampaigns);
// router.get("/campaigns/published", validateToken, handleGetPublishedCampaigns);
// router.post("/campaigns/new", validateToken, handleGetPublishedCampaigns);
// router.post("/campaigns/:campaignId/edit", validateToken, handleGetPublishedCampaigns);


export default router;
