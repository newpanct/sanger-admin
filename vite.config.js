import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "treat-js-files-as-jsx",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    react(),
  ],
  server: {
    port: 8002,
    host: true,
  },
  preview: {
    port: 8002,
    host: true,
  },
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    include: ["antd", "@ant-design/icons"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
