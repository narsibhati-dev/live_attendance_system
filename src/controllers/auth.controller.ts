import type { Request, Response } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { success } from "zod";

export const signupController = async (req: Request, res: Response) => {
  try {
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {},
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
