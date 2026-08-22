import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shreyas.cgpacalculator",
  appName: "CGPA Calculator",
  webDir: "dist/public",
  backgroundColor: "#020714",
  loggingBehavior: "debug",
  android: {
    allowMixedContent: false,
    zoomEnabled: false,
  },
};

export default config;
