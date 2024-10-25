import express from "express";
import cors from "cors";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";
import contactsRouter from "./routes/contactsRoutes.js";

const logger = pino();
const expressLogger = expressPinoLogger({ logger });

function setupServer() {
  const app = express();

  app.use(cors());
  app.use(expressLogger);
  app.use(express.json());

  app.use("/contacts", contactsRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: "Not found",
    });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

export { setupServer };