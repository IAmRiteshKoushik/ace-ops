import { prismaClient } from "@/main";
import { createToken } from "@/middleware/authentication/token";
import { AdminLoginRequest } from "@/types/login";
import { Request, Response } from "express";
import { CreateAdminValidator } from "@/types/register";
import { RandomPassword } from "@/config/pwd_generator";
import { sendAdminPassword } from "@/mail/mailer";
import { newHash } from "@/config/hash";

// Existing login handler
export const AdminLoginHandler = async (req: Request, res: Response) => {
  const validBody = AdminLoginRequest.safeParse(req.body);

  if (validBody.success !== true) {
    return res.status(400).json({
      message: "Bad Request"
    });
  }

  try {
    const existingAdmin = await prismaClient.admin.findFirst({
      where: {
        email: validBody.data.email,
        password: validBody.data.password,
      }
    });

    if (!existingAdmin) {
      console.log(existingAdmin)
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
    console.log(e)
    return res.status(500).json({
      message: "Internal Server Error! Please try again later."
    });
  }
}

// New handler to get current admin details
export const GetAllAdminHandler = async (req: Request, res: Response) => {
  try {
    const currentAdmins = await prismaClient.admin.findMany(
      {
        where: {
          isActive: true,
        },
        select: {
          firstName: true,
          lastName: true,
          department: true,
          email: true,
          role: true
        },

      }
    );

    if (!currentAdmins) {
      return res.status(404).json({
        message: "No admin found"
      });
    }

    return res.status(200).json({
      message: "Admin details fetched successfully",
      admins: currentAdmins
    });
  } catch (e) {
    return res.status(500).json({
      message: "Failed to retrieve admin details"
    });
  }
};


export const CreateAdminHandler = async (req: Request, res: Response) => {
  const details = CreateAdminValidator.safeParse(req.body);

  if (!details.success) {
    return res.status(400).json({
      message: "Bad Request"
    });
  }

  const facultyEmail = details.data.facultyEmail;
  const facultyPassword = details.data.facultyPassword;

  try {
    const admins = await prismaClient.$transaction(async (trx) => {
      // Checking if faculty exists
      const existingFaculty = await trx.admin.findFirst({
        where: {
          email: facultyEmail,
          password: facultyPassword,
          role: "Faculty"
        }
      });

      if (!existingFaculty) {
        throw new Error("FacultyNotFound");  // Signal faculty not found
      }

      const password = RandomPassword();
      const doubleHashedPassword = newHash(newHash(password));

      const newAdmin = await trx.admin.create({
        data: {
          firstName: details.data.adminFirstName,
          lastName: details.data.adminLastName,
          department: details.data.department,
          email: details.data.adminEmail,
          isActive: true,
          password: doubleHashedPassword,
        }
      });

      // Send email to new admin
      sendAdminPassword(newAdmin.firstName, newAdmin.email, password);

    });

    // Return success response
    return res.status(201).json({
      message: "Admin created successfully",
    });

  } catch (e) {
    if (e instanceof Error && e.message === "FacultyNotFound") {
      return res.status(404).json({
        message: "Faculty not found"
      });
    } else if (e instanceof Error && e.message === "InvalidFaculty") {
      return res.status(403).json({
        message: "User is not a faculty"
      });
    } else {
      // Handle other unexpected errors
      return res.status(500).json({
        message: "Internal Server Error"
      });
    }
  }
};

export const GetPastAdminHandler = async (_ : Request, res : Response) => {
  try {
    const pastAdmins = await prismaClient.admin.findMany({
      where : {
        isActive : false
      },
      select : {
        id : true,
        firstName : true,
        lastName : true,
        email : true,
        department : true,
        role : true
      }
    });
    return res.status(200).json({
      pastAdmins
    })
  }
  catch (e) {
    return res.status(500).json({
      message : "Internal Server Error! Please try again later."
    });
  }
}