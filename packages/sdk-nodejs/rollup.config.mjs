import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";

const common = {
  plugins: [alias(), resolve(), commonjs(), json()],
};
export default [
  {
    input: "./src/index.js",
    output: {
      name: "main",
      file: "lib/index.esm.js",
      format: "esm",
      sourcemap: false,
    },
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
    plugins: [...common.plugins],
  },
];
