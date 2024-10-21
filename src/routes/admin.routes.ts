import { AdminLoginHandler } from "@/controllers/admin/office";
import { Router } from "express";
import { validateToken } from "@/middleware/authentication/token";
import {
  GetAllEventsHandler,
  GetEventByIdHandler,
  CreateEventHandler,
  EditEventHandler,
} from "@/controllers/admin/event";
import { AdminDashboardHandler } from "@/controllers/admin/office";

const router = Router();

// Admin-Controls
router.post("/office/login", AdminLoginHandler);
router.get("/office/dashboard", validateToken, AdminDashboardHandler);
// router.get("/office", validateToken, GetAllAdminHandler);
// router.post("/office/new", validateToken, CreateAdminHandler);
// router.post("/office/edit/{adminId}", validateToken, EditAdminHandler);

// Events
router.get("/events", validateToken, GetAllEventsHandler);
router.get("/events/:eventId", validateToken, GetEventByIdHandler);
router.post("/events/new", validateToken, CreateEventHandler);
router.post("/events/edit/:eventId", validateToken, EditEventHandler);
  
// Campaigns
// router.get("/campaigns", validateToken, handleGetAllCampaigns);
// router.get("/campaigns/:campaignId", validateToken, handleGetAllCampaigns);
// router.get("/campaigns/planned", validateToken, handleGetPlannedCampaigns);
// router.get("/campaigns/published", validateToken, handleGetPublishedCampaigns);
// router.post("/campaigns/new", validateToken, handleGetPublishedCampaigns);
// router.post("/campaigns/:campaignId/edit", validateToken, handleGetPublishedCampaigns);


export default router;
