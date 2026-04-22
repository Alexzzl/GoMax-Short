import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "assets",
          dest: "."
        },
        {
          src: "icon.png",
          dest: "."
        },
        {
          src: "config.xml",
          dest: "."
        }
      ]
    })
  ],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true
  }
});
