import { prismaClient } from "@/main";
import { createToken } from "@/middleware/authentication/token";
import { AdminLoginRequest } from "@/types/login";
import { group } from "console";
import { Request, Response } from "express";
import { date } from "zod";

export const AdminLoginHandler = async (req: Request, res: Response) => {
  const validBody = AdminLoginRequest.safeParse(req.body);

  if (validBody.success !== true) {
    return res.status(400).json({
      message: "Bad Request"
    });
  }

  try {
    const existingAdmin = await prismaClient.user.findFirst({
      where: {
        email: validBody.data.email,
        password: validBody.data.password,
      }
    });

    if (!existingAdmin) {
      return res.status(403).json({
        message: "Username or Password does not match!"
      });
    }

    const accessToken = await createToken(validBody.data.email);

    return res.status(200).json({
      message: "Login Successful",
      adminFirstName: existingAdmin.firstName,
      adminLastName: existingAdmin.lastName,
      adminEmail: existingAdmin.email,
      accessToken,
    });
  } catch (e) {
    // TODO: Setup logger for all internal server errors
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}

export const AdminDashboardHandler = async (req: Request, res: Response) => {
  try{

    const now = new Date();
    const thisyear_start = new Date(now.getFullYear(),0,1);
    const lastyear_start = new Date(now.getFullYear()-1,0,1);

    const users = await prismaClient.user.findMany({
      select:{
        createdAt:true
      }
    });

    const activeMembers_thisyear = users.filter((user) => user.createdAt && user.createdAt >= thisyear_start).length;
    const activeMembers_alltime = users.length;
    const activeMembers_lastyear = users.filter((user) => user.createdAt && user.createdAt >= lastyear_start && user.createdAt < thisyear_start).length;

    const events = await prismaClient.event.findMany({
      select:{
        endTime:true,
        startTime:true
      }
    });
    
    const eventsCompleted_thisyear = events.filter((event)=>event.endTime && event.endTime>thisyear_start && event.endTime<=now).length;
    const eventsCompleted_alltime = events.filter((event)=>event.endTime && event.endTime<=now).length;
    const eventsCompleted_lastyear = events.filter((event)=>event.endTime && event.endTime>=lastyear_start && event.endTime<thisyear_start).length;

    const registrations = await prismaClient.registration.findMany({
      select:{
        createdAt:true
      }
    });

    const registrations_thisyear = registrations.filter((registration)=>registration.createdAt && registration.createdAt>=thisyear_start).length;
    const events_thisyear = events.filter((event)=>event.startTime && event.startTime>=thisyear_start).length;

    let avgregistrations_thisyear = registrations_thisyear/events_thisyear;

    if(isNaN(avgregistrations_thisyear)){
      avgregistrations_thisyear = 0;
    }

    const registrations_alltime = registrations.length;
    const events_alltime = events.length;

    let avgregistrations_alltime = registrations_alltime/events_alltime;

    if(isNaN(avgregistrations_alltime)){
      avgregistrations_alltime = 0;
    }

    const registrations_lastyear = registrations.filter((registration)=>registration.createdAt && registration.createdAt>=lastyear_start && registration.createdAt<thisyear_start).length;
    const events_lastyear = events.filter((event)=>event.startTime && event.startTime>=lastyear_start && event.startTime<thisyear_start).length;

    let avgregistrations_lastyear = registrations_lastyear/events_lastyear;

    if(isNaN(avgregistrations_lastyear)){
      avgregistrations_lastyear = 0;
    }

    const campaigns = await prismaClient.campaign.findMany({
      select:{
        createdAt:true
      }
    });

    const campaign_thisyear = campaigns.filter((campaign)=>campaign.createdAt && campaign.createdAt>=thisyear_start).length;
    const campaign_alltime = campaigns.length;
    const campaign_lastyear = campaigns.filter((campaign)=>campaign.createdAt && campaign.createdAt>=lastyear_start && campaign.createdAt<thisyear_start).length;

    const data = {
      ActiveMembers: {
        ThisYear: activeMembers_thisyear,
        AllTime: activeMembers_alltime,
        LastYear: activeMembers_lastyear
      },
      EventsCompleted: {
        ThisYear: eventsCompleted_thisyear,
        AllTime: eventsCompleted_alltime,
        LastYear: eventsCompleted_lastyear
      },
      AvgAttendeesPerEvent:{
        ThisYear: avgregistrations_thisyear.toFixed(3),
        AllTime: avgregistrations_alltime.toFixed(3),
        LastYear: avgregistrations_lastyear.toFixed(3)
      },
      Campaigns:{
        ThisYear: campaign_thisyear,
        AllTime: campaign_alltime,
        LastYear: campaign_lastyear
      }
    }

    const registration = await prismaClient.event.findMany({
      select: {
        startTime: true,
        Registration:true
      }
    })

    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    const attendees_month = new Array(12).fill(0);

    registration.forEach((event)=>{
      if (event.startTime && event.startTime.getFullYear()==new Date().getFullYear() && event.Registration){
        attendees_month[new Date(event.startTime).getMonth()] += event.Registration.length;
      }
    });

    const char_data = attendees_month.map((attendees: number, index: number) => ({
      month: month[index],attendees: attendees
    }));

    return res.status(200).json({
      data,
      char_data
    });
  }


  catch (e) {
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}