import express from "express";
import { getAllStudentsContolller } from "../controllers/students.controller";

export const studentsRouter = express.Router();

studentsRouter.get("/", getAllStudentsContolller);
