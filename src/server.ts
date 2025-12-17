import express from "express";
import type { Request, Response } from "express";
import { PORT } from "./config";
import { HTTP_STATUS } from "./types/http_status";
import { authRouter } from "./routers/auth.routes";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "welcome to live attendance system",
  });
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log("[ server ] is running on http://localhost:3000");
});
