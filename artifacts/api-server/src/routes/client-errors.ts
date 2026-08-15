import { Router, type IRouter } from "express";
import { ReportClientErrorBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { clientErrorLimiter } from "../lib/rate-limit";

const router: IRouter = Router();

router.post("/client-errors", clientErrorLimiter, (req, res) => {
  const report = ReportClientErrorBody.safeParse(req.body);

  // Answers 204 either way. A page that has already crashed gains nothing from
  // being told its crash report was malformed, and the endpoint is open, so a
  // 400 would only be useful to someone probing it.
  if (report.success) {
    logger.error(
      {
        source: "browser",
        kind: report.data.kind,
        path: report.data.path,
        stack: report.data.stack,
        userAgent: req.get("user-agent"),
      },
      `Browser: ${report.data.message}`,
    );
  } else {
    logger.warn({ source: "browser" }, "Unreadable crash report");
  }

  res.status(204).end();
});

export default router;
