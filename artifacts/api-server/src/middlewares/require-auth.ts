import type { RequestHandler } from "express";
import { getUserForToken, SESSION_COOKIE_NAME } from "../lib/session";
import { HttpError } from "../lib/http-error";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.signedCookies?.[SESSION_COOKIE_NAME];

  if (typeof token !== "string") {
    next(HttpError.unauthorized());
    return;
  }

  getUserForToken(token)
    .then((user) => {
      if (!user) {
        next(HttpError.unauthorized());
        return;
      }

      req.user = user;
      next();
    })
    .catch(next);
};
