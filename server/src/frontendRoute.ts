import path from "node:path";

import { DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler";
import {
  buildCspHeader,
  fetchDecoratorHtml,
  injectDecoratorServerSide,
} from "@navikt/nav-dekoratoren-moduler/ssr/index.js";
import { addViteModeHtmlToResponse } from "@navikt/vite-mode";
import express, { Router } from "express";

import config from "./config.js";

const csp = await buildCspHeader(
  config.app.env === "prod"
    ? {
        "img-src": ["data:", "'self'"],
        "connect-src": ["https://telemetry.nav.no/collect"],
      }
    : {
        "img-src": ["data:", "'self'"],
        "script-src-elem": ["http://localhost:*"],
        "style-src-elem": ["http://localhost:*"],
        "connect-src": [
          "https://telemetry.ekstern.dev.nav.no/collect",
          "http://localhost:*",
        ],
      },
  { env: config.app.env },
);

const dekoratørProps = {
  env: config.app.env,
  params: {
    context: "arbeidsgiver",
    simple: false,
    logoutWarning: true,
    chatbot: false,
  },
} satisfies DecoratorFetchProps;

export function setupStaticRoutes(router: Router) {
  router.use(express.static("./public", { index: false }));
  // When deployed, the built frontend is copied into the public directory. If running BFF locally the index.html will not exist.
  const spaFilePath = path.resolve("./public", "index.html");

  router.use((request, response, next) => {
    response.setHeader("Content-Security-Policy", csp);
    return next();
  });

  // Only add vite-mode to dev environment
  if (config.app.env === "dev") {
    addViteModeHtmlToResponse(router, {
      subpath: config.app.nestedPath,
      port: "5173",
      useNonce: false,
    });
  }
  // Fra Express 5 er wildcard ruten erstattet med *splat: https://expressjs.com/en/guide/migrating-5.html
  router.get("/*splat", async (request, response) => {
    const viteModeHtml = response.viteModeHtml;

    if (viteModeHtml) {
      response.send(await injectViteModeHtml(viteModeHtml));
      return;
    }

    const html = await injectDecoratorServerSide({
      filePath: spaFilePath,
      ...dekoratørProps,
    });

    response.send(replaceNaisMetaTags(html));
  });
}

async function injectViteModeHtml(html: string) {
  const {
    DECORATOR_HEADER,
    DECORATOR_HEAD_ASSETS,
    DECORATOR_SCRIPTS,
    DECORATOR_FOOTER,
  } = await fetchDecoratorHtml(dekoratørProps);

  return [
    DECORATOR_HEADER,
    DECORATOR_HEAD_ASSETS,
    DECORATOR_SCRIPTS,
    html,
    DECORATOR_FOOTER,
  ].join("");
}

const replaceNaisMetaTags = (html: string) => {
  const metaTags = [
    { name: 'nais-telemetry-url', content: process.env.NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL },
    { name: 'nais-app', content: process.env.NAIS_APP_NAME },
    { name: 'nais-team', content: process.env.NAIS_TEAM ?? process.env.NAIS_NAMESPACE },
    { name: 'nais-cluster', content: process.env.NAIS_CLUSTER_NAME },
    { name: 'nais-version', content: process.env.NAIS_APP_IMAGE?.split(':').at(-1) },
  ];

  const tags = metaTags
    .filter((tag): tag is { name: string; content: string } => Boolean(tag.content))
    .map((tag) => `<meta name="${tag.name}" content="${tag.content}" />`)
    .join('\n    ');

  return html.replaceAll('{{{NAIS_META_TAGS}}}', tags);
};
