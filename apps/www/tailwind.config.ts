import baseConfig from "@mocknica/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: [
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [baseConfig],
} satisfies Config;