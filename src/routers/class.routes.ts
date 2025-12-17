import express from "express";
import {
  addStudentToClassController,
  createClassController,
  getClassByIdController,
} from "../controllers/class.controller";

export const classRouter = express.Router();

classRouter.post("/", createClassController);
classRouter.post("/:id/add-student", addStudentToClassController);
classRouter.get("/class/:id", getClassByIdController);
