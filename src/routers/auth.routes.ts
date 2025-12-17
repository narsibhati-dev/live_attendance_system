import express from "express";
import {
  loginController,
  meController,
  signupController,
} from "../controllers/auth.controller";

export const authRouter = express.Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.get("/me", meController);
