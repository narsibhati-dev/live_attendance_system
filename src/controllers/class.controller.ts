import { type Request, type Response } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { ClassNameSchema, type RoleInfer } from "../types/routes-types";
import { client } from "../database/client";

export const createClassController = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.auth as { userId: string; role: RoleInfer };
    const { className } = req.body;

    if (!userId || !role || !className) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    const parseData = ClassNameSchema.safeParse(req.body);
    if (!parseData.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    if (role !== "teacher") {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: "Forbidden, teacher access required",
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

    const classExists = await client.class.findUnique({
      where: {
        className: parseData.data.className,
      },
    });
    if (classExists) {
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          _id: classExists.id,
          className: classExists.className,
          teacherId: classExists.teacherId,
          studentIds: [],
        },
      });
      return;
    }

    const newClass = await client.class.create({
      data: {
        className: parseData.data.className,
        teacherId: userId,
      },
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        _id: newClass.id,
        className: newClass.className,
        teacherId: newClass.teacherId,
        studentIds: [],
      },
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const addStudentToClassController = async (
  req: Request,
  res: Response
) => {};

export const getClassByIdController = async (req: Request, res: Response) => {};

export const getAllStudents = async (req: Request, res: Response) => {};
