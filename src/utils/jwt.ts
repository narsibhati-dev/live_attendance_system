import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import type { TOKEN_PAYLOAD } from "../types/token_payload";

export const generateToken = ({ userId, role }: TOKEN_PAYLOAD) => {
  const token = jwt.sign({ userId, role }, JWT_SECRET as string);
  return token;
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TOKEN_PAYLOAD;
  } catch {
    return false;
  }
};
