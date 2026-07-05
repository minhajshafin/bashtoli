import type { Config } from "tailwindcss";

// Note: Bashtoli uses Tailwind CSS v4.
// Configuration is primarily managed in `app/globals.css` using CSS `@theme` variables.
// This file is kept for backwards compatibility and tool integrations (like IDE plugins).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
