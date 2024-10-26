import express from "express";
import cors from "cors";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import contactsRouter from "./routes/contactsRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";

const logger = pino();
const expressLogger = expressPinoLogger({ logger });

function setupServer() {
  const app = express();

  app.use(cookieParser());
  app.use(cors());
  app.use(expressLogger);
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/contacts", contactsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

export { setupServer };