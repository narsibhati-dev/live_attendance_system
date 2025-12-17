import type { RoleInfer } from "./routes-types";

export interface TOKEN_PAYLOAD {
  userId: string;
  role: RoleInfer;
}
