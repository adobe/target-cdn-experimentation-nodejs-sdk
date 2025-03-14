import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import copy from "rollup-plugin-cpy";

const common = {
  external: [
    "log",
    "http-request",
    "crypto",
    "create-response",
    "html-rewriter",
    "cookies",
  ],
  plugins: [alias(), resolve(), commonjs(), json()],
};
export default [
  {
    input: "./demo/index.js",
    output: {
      name: "main",
      file: "dist/demo/main.js",
      format: "esm",
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external: common.external,
    plugins: [
      copy({
        files: ["demo/bundle.json"],
        dest: "dist/demo",
      }),
      ...common.plugins,
    ],
  },
  {
    input: "./src/index.js",
    output: {
      name: "main",
      file: "lib/index.esm.js",
      format: "esm",
      sourcemap: false,
    },
    external: common.external,
    plugins: [...common.plugins],
  },
  {
    input: "./src/index.js",
    output: {
      name: "main",
      file: "lib/index.cjs.js",
      format: "cjs",
      sourcemap: false,
    },
    external: common.external,
    plugins: [...common.plugins],
  },
];
