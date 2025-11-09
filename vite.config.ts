import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    nitroV2Plugin(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  ssr: {
    noExternal: ["@rainbow-me/rainbowkit", "@vanilla-extract/sprinkles"],
  },
  optimizeDeps: {
    include: ["@vanilla-extract/sprinkles"],
  },
});

export default config;
