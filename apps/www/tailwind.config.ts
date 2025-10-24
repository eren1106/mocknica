import baseConfig from "@mocknica/tailwind-config";
import type { Config } from "tailwindcss";

const config: Config = {
  ...baseConfig,
  content: [
    ...(baseConfig.content as string[]),
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;