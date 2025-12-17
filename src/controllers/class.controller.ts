import { type Request, type Response } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { ClassNameSchema, type RoleInfer } from "../types/routes-types";
import { client } from "../database/client";
import { success } from "zod";

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
) => {
  try {
    const auth = req.auth as { userId?: string } | undefined;

    if (!auth?.userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { userId } = auth;
    const { studentId } = req.body;
    const { id: classId } = req.params;

    if (!studentId || !classId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
    }

    const classData = await client.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        className: true,
        teacherId: true,
        students: {
          select: { id: true },
        },
      },
    });

    if (!classData) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "Class not found",
      });
    }

    const teacher = await client.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!teacher) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "User not found",
      });
    }

    if (teacher.role !== "teacher") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: "Forbidden, teacher access required",
      });
    }

    if (classData.teacherId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: "Forbidden, not class teacher",
      });
    }

    const student = await client.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });

    if (!student) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "Student not found",
      });
    }

    if (student.role !== "student") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "User is not a student",
      });
    }

    const isStudentAlreadyInClass = classData.students.some(
      (s) => s.id === studentId
    );

    if (isStudentAlreadyInClass) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          _id: classData.id,
          className: classData.className,
          teacherId: classData.teacherId,
          studentIds: classData.students.map((s) => s.id),
        },
      });
    }

    const updatedClass = await client.class.update({
      where: { id: classId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
      select: {
        id: true,
        className: true,
        teacherId: true,
        students: {
          select: { id: true },
        },
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        _id: updatedClass.id,
        className: updatedClass.className,
        teacherId: updatedClass.teacherId,
        studentIds: updatedClass.students.map((s) => s.id),
      },
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getClassByIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth as { userId: string };
    const { id } = req.params;

    if (!userId || !id) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    const classExists = await client.class.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        className: true,
        teacherId: true,
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!classExists) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "Class not found",
      });
      return;
    }

    const userExist = await client.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExist) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const isOwningTeacher =
      userExist.role === "teacher" && classExists.teacherId === userId;
    const isEnrolledStudent =
      userExist.role === "student" &&
      classExists.students.some((s) => s.id === userId);

    if (!isOwningTeacher && !isEnrolledStudent) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: "Forbidden, not class teacher",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        _id: classExists.id,
        className: classExists.className,
        students: classExists.students.map((student) => ({
          _id: student.id,
          name: student.name,
          email: student.email,
        })),
      },
    });
    return;
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
