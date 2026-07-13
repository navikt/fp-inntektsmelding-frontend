import { Router } from "express";

export const setupSkjermleserCssTilgang = (router: Router) => {
  router.use((req, res, next) => {
    if (req.path.endsWith(".css")) {
      res.setHeader("Access-Control-Allow-Origin", "https://nav.psplugin.com");
    }

    next();
  });
};
