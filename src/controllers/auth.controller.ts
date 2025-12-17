import type { Request, Response } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { LoginSchema, SignupSchema } from "../types/routes-types";
import { client } from "../database/client";
import { HashPassword, VerifyPassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { success } from "zod";

export const signupController = async (req: Request, res: Response) => {
  try {
    const parseData = SignupSchema.safeParse(req.body);
    if (!parseData.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    const userExist = await client.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });

    if (userExist) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Email already exists",
      });
      return;
    }

    const hashedPassword = await HashPassword(parseData.data.password);
    if (hashedPassword) {
      const newUser = await client.user.create({
        data: {
          name: parseData.data.name,
          email: parseData.data.email,
          role: parseData.data.role,
          password: hashedPassword,
        },
      });

      if (!newUser) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: "INTERNAL_SERVER_ERROR",
        });
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          _id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const parseData = LoginSchema.safeParse(req.body);
    if (!parseData.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid request schema",
      });
      return;
    }

    const userExist = await client.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });

    if (!userExist) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }
    const result = await VerifyPassword(
      parseData.data.password,
      userExist.password
    );

    if (!result) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const token = generateToken({
      userId: userExist.id,
      role: userExist.role,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        token,
      },
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
    return;
  }
};

export const meController = async (req: Request, res: Response) => {
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
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: "user not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        _id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
      },
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
