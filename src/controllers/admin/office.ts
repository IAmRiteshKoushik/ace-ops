import { CustomError } from "@/errors/error";
import { prismaClient } from "@/main";
import { createToken } from "@/middleware/authentication/token";
import { EditAdminValidator } from "@/types/admin";
import { EventEditValidator } from "@/types/auth";
import { AdminLoginRequest } from "@/types/login";
import { Request, Response } from "express";

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
    console.log(e)
    return res.status(500).json({
      message: "Failed to retrieve admin details"
    });
  }
};

export const EditAdminHandler = async (req: Request & { user: { email: string; role: 'Student' | 'Faculty' } }, res: Response) => {
  try {
    const validBody = EditAdminValidator.safeParse(req.body);
    
    if (!validBody.success) {
      res.status(400).json({
        message: "Invalid input data",
      });
      throw new CustomError("Invalid input data");
    }

    return await prismaClient.$transaction(async (tx) => {
      const adminToEdit = await tx.admin.findFirst({
        where: {
          email: req.params.email
        },
      });

      if (!adminToEdit) {
        res.status(404).json({
          message: "Admin not found",
        });
        throw new CustomError("Admin not found");
      }

      if (req.user.role === "Student" && req.user.email !== req.params.email) {
        res.status(403).json({
          message: "Students can only edit their own details",
        });
        throw new CustomError("Unauthorized access");
      }

      if (req.user.role === "Student") {
        const updatedAdmin = await tx.admin.update({
          where: { id: adminToEdit.id }, 
          data: {
            firstName: validBody.data.firstName,
            lastName: validBody.data.lastName,
            email: validBody.data.email,
            department: validBody.data.department,
          },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        });

        return res.status(200).json({
          message: "Admin details updated successfully",
          data: updatedAdmin,
        });
      }

      const updatedAdmin = await tx.admin.update({
        where: { id: adminToEdit.id }, 
        data: {
          ...validBody.data,  
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          department: true,
        },
      });

      return res.status(200).json({
        message: "Admin details updated successfully",
        data: updatedAdmin,
      });
    });
  } catch (error) {

    if (error instanceof CustomError) {
      return;
    }

    return res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};