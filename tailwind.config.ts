import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: "#ccdbdc",
        "frosted-blue": "#9ad1d4",
        "frosted-blue-2": "#80ced7",
        cerulean: "#007ea7",
        "deep-space-blue": "#003249",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(0, 50, 73, 0.14)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(154, 209, 212, 0.72), transparent 38%), radial-gradient(circle at bottom right, rgba(0, 126, 167, 0.2), transparent 34%)",
      },
    },
  },
  plugins: [],
};

export default config;
