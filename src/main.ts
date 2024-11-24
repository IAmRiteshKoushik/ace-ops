import express from "express";
import cors from "cors";
import helmet from "helmet";
import generateKey from "./encryption/generate";

import adminRouter from "@/routes/admin.routes"
import generalRouter from "@/routes/user.routes"
// import eventRouter from "@/routes/event.routes"

import { PrismaClient } from "@prisma/client";

const server = express();
const port = process.env.PORT || 8080;
export const prismaClient = new PrismaClient();

server.use(express.json());
server.use(cors());
server.disable("x-powered-by");
server.use(helmet());

server.use("/api/v1/test", (_, res) => {
  res.status(200).json({
    messsage: "Test: Server is running",
  });
});

server.use("/api/v1/admin", adminRouter);
server.use("/api/v1/user", generalRouter);
// server.use("/api/v1/mail", mailRouter);
// server.use("/api/v1/event", eventRouter);

server.use("*", (_, res) => {
  res.status(404).json({
    message: "Not Found",
  });
});

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

generateKey();