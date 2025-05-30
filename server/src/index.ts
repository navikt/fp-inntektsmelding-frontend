import config from "./config.js";
import logger from "./logger.js";
import server from "./server.js";

const hostName = config.app.host;
const port = config.app.port;

server.listen(port, hostName, () => {
  logger.info(
    `Starter fp-inntektsmelding-frontend server på ${hostName}:${port}`,
  );
});
