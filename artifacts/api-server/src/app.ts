import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/error-handler";

const cookieSecret = process.env["COOKIE_SECRET"];

if (!cookieSecret) {
  throw new Error(
    "COOKIE_SECRET environment variable is required but was not provided.",
  );
}

const app: Express = express();

// Render terminates TLS and forwards, so without this every request arrives
// from the proxy's address and the rate limiters would treat all visitors as
// one. Exactly one hop is trusted: trusting the whole chain would let a caller
// invent an X-Forwarded-For and hand themselves a fresh quota per request.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env["FRONTEND_ORIGIN"] ?? "http://localhost:8080",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(cookieSecret));

app.use("/api", router);

app.use(errorHandler);

export default app;
