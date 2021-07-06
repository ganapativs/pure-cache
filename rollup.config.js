import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const getPlugins = () => [
  resolve(),
  babel({
    comments: true,
    exclude: "node_modules/**",
  }),
  commonjs(),
];

export default [
  {
    input: "src/pureCache.js",
    output: {
      name: "PureCache",
      file: pkg.browser,
      format: "umd",
      sourcemap: true,
    },
    plugins: getPlugins().concat([terser()]),
  },
  {
    input: "src/pureCache.js",
    external: ["mitt"],
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "auto",
      },
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: getPlugins(),
  },
];
