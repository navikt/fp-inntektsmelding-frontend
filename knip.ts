import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreBinaries: ["playwright"],
  workspaces: {
    "app": {},
    "server": {},
  },
};

export default config;
