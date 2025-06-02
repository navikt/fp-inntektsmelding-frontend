import { getToken, validateToken } from "@navikt/oasis";
import { NextFunction, Request, Response } from "express";

import logger from "./logger.js";

export const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const token = getToken(request);
  if (!token) {
    response.status(401).send();
    return;
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    logger.error(
      `Validering av token feilet. ${validation.errorType}`,
      validation.error,
    );
    response.status(403).send();
    return;
  }

  return next();
};
