import express from "express";
import { createClassController } from "../controllers/class.controller";

export const classRouter = express.Router();

classRouter.post("/", createClassController);
classRouter.post("/:id/add-student");
