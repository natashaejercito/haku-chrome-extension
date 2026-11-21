import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: "Haku",
  version: "0.1.0",
  description: "Your guide through the job search.",
  action: { default_title: "Open Haku" },
  side_panel: { default_path: "index.html" },
  background: { service_worker: "src/background.ts", type: "module" },
  permissions: ["sidePanel", "storage", "scripting", "activeTab"],
  host_permissions: [
    "https://www.linkedin.com/*",
    "https://*.greenhouse.io/*",
    "https://*.myworkdayjobs.com/*",
    "https://*.indeed.com/*",
  ],
});