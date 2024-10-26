import { Router } from "express";
import {
  registerController,
  loginController,
  refreshSessionController,
  logoutController,
} from "../controllers/authController.js";
import validateBody from "../middlewares/validateBody.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerController);
authRouter.post("/login", validateBody(loginSchema), loginController);
authRouter.post("/refresh", refreshSessionController);
authRouter.post("/logout", logoutController);

export default authRouter;