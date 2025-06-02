import { Router } from "express";

import logger from "./logger.js";

export function setupActuators(router: Router) {
  router.get("/internal/health/isAlive", (request, response) => {
    response.send({
      status: "UP",
    });
  });

  logger.info("Liveness available on /internal/health/isAlive");

  router.get("/internal/health/isReady", (request, response) => {
    response.send({
      status: "UP",
    });
  });
  logger.info("Readiness available on /internal/health/isReady");
}
