import { type Request, type Response } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { client } from "../database/client";

export const getAllStudentsContolller = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth as { userId: string };

    if (!userId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    const userExist = await client.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExist) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    if (userExist.role !== "teacher") {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: "Forbidden, teacher access required",
      });
      return;
    }

    const allStudents = await client.user.findMany({
      where: {
        role: "student",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!allStudents) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: [],
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: allStudents.map(
        (student: { id: string; name: string; email: string }) => ({
          _id: student.id,
          name: student.name,
          email: student.email,
        })
      ),
    });
    return;
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
