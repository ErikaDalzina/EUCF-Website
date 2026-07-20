import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Two projects: sync-script/data tests run in plain node, component tests in
// jsdom with the testing-library setup. Run everything with `npm test`.
// resolve.tsconfigPaths picks up the @/* alias from tsconfig.json.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["tests/scripts/**/*.test.ts", "tests/data/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.tsx"],
        },
      },
    ],
  },
});
