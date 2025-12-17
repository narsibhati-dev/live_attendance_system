import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../types/http_status";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers?.authorization;

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized, token missing or invalid",
      });
      return;
    }

    const verifyedTokenDecode = verifyToken(token);

    if (!verifyedTokenDecode) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized, token missing or invalid",
      });
      return;
    }

    req.auth = {
      userId: verifyedTokenDecode.userId,
      role: verifyedTokenDecode.role,
    };
    next();
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
