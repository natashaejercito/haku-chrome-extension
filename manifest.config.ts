import { defineManifest } from "@crxjs/vite-plugin";
import { loadEnv } from "vite";

export default defineManifest(({ mode }) => {
  const { VITE_SERVER_URL } = loadEnv(mode, process.cwd(), "");
  return {
    manifest_version: 3,
    name: "Haku",
    version: "0.1.0",
    description: "Your guide through the job search.",
    action: {
      default_title: "Open Haku",
      version: "1.0.0",
      icons: {
        16: "icons/icon-16.png",
        32: "icons/icon-32.png",
        48: "icons/icon-48.png",
        128: "icons/icon-128.png",
      },
      action: {
        default_title: "Open Haku",
        default_icon: {
          16: "icons/icon-16.png",
          32: "icons/icon-32.png",
        },
      },
    },
    side_panel: { default_path: "index.html" },
    background: { service_worker: "src/background.ts", type: "module" },
    permissions: ["sidePanel", "storage", "scripting", "activeTab"],
    host_permissions: [
      "https://www.linkedin.com/*",
      "https://*.greenhouse.io/*",
      "https://*.myworkdayjobs.com/*",
      "https://*.indeed.com/*",
      `${VITE_SERVER_URL}/*`,
    ],
  };
});
