import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import copy from "rollup-plugin-cpy";

const common = {
  plugins: [alias(), resolve(), commonjs(), json()],
};

export default [
  {
    input: "./demo/server.js",
    output: {
      name: "main",
      file: "dist/demo/main.js",
      format: "esm",
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: [
      copy({
        files: ["demo/index.html", "demo/sample1.json"],
        dest: "dist/demo",
      }),
      ...common.plugins,
    ],
  },
  {
    input: "./src/index.js",
    output: {
      name: "main",
      file: "dist/lib/es/index.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: [...common.plugins],
  },
  {
    input: "./src/index.js",
    output: {
      name: "main",
      file: "dist/lib/cjs/index.js",
      format: "cjs",
      sourcemap: false,
    },
    plugins: [...common.plugins],
  },
];
