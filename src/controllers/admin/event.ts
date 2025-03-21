import { prismaClient } from "@/main";
import { Request, Response } from "express";
import { CreateEventValidator, EventEditValidator } from "@/types/event";
import { z } from "zod";


export const GetAllEventsHandler = async (_: Request, res: Response) => {
  try {
    const events = await prismaClient.event.findMany({
      select: {
        id: true,
        name: true,
        venue: true,
        entry: true,
        startTime: true,
        status: true
      }
    });
    return res.status(200).json({
      events
    });
  }
  catch (e) {
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }

}


export const GetEventByIdHandler = async (req: Request, res: Response) => {
  const eventId = z.string().cuid().safeParse(req.params.eventId);
  if (!eventId.success) {
    return res.status(400).json({
      message: "Invalid Event ID provided!"
    })
  };

  try {
    const event = await prismaClient.event.findFirst({
      where: {
        id: eventId.data
      }
    });
    if (!event) {
      return res.status(404).json({
        message: "Event not found!"
      });
    }
    return res.status(200).json({
      event
    });
  }
  catch (e) {
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}

export const CreateEventHandler = async (req: Request, res: Response) => {

  const validevent = CreateEventValidator.safeParse(req.body);

  if (!validevent.success) {
    console.log(validevent.error);
    return res.status(400).json({
      message: "Invalid Event data provided!"
    });
  }

  try {
    const event = await prismaClient.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          name: validevent.data.name,
          startTime: validevent.data.startTime,
          endTime: validevent.data.endTime,
          guests: validevent.data.guests,
          venue: validevent.data.venue,
          posterURL: validevent.data.posterURL,
          recordingURL: validevent.data.recordingURL,
          tags: validevent.data.tags,
          status: validevent.data.status,
          entry: validevent.data.entry,
          mode: validevent.data.mode,
          eventFee: validevent.data.eventFee,
        },
      });
      return createdEvent;
    });

    return res.status(200).json({
      event
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}

export const EditEventHandler = async (req: Request, res: Response) => {

  const validevent = EventEditValidator.safeParse(req.body);
  if (!validevent.success) {
    console.log(validevent.error);
    return res.status(400).json({
      message: "Invalid Event data provided!"
    });
  }

  const id = z.string().cuid().safeParse(req.params.eventId);
  if (!id.success) {
    return res.status(400).json({
      message: "Invalid Event ID provided!"
    })
  };

  const event = await prismaClient.event.findFirst({
    where: {
      id: id.data
    }
  })
  if (!event) {
    return res.status(404).json({
      message: "Event not found!"
    })
  }

  try {
    const event = await prismaClient.$transaction(async (tx) => {
      const updatedEvent = await tx.event.update({
        where: {
          id: id.data
        },
        data: {
          name: validevent.data.name,
          startTime: validevent.data.startTime,
          endTime: validevent.data.endTime,
          guests: validevent.data.guests,
          venue: validevent.data.venue,
          posterURL: validevent.data.posterURL,
          recordingURL: validevent.data.recordingURL,
          tags: validevent.data.tags,
          status: validevent.data.status,
          entry: validevent.data.entry,
          mode: validevent.data.mode,
          eventFee: validevent.data.eventFee,
        },
      });
      return updatedEvent;
    });

    return res.status(200).json({
      event
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}
