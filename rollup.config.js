import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import pkg from "./package.json";

const getPlugins = () => [
  resolve(),
  babel({
    comments: true,
    exclude: "node_modules/**"
  }),
  commonjs()
];

export default [
  {
    input: "src/pure-cache.js",
    output: {
      name: "PureCache",
      file: pkg.browser,
      format: "umd",
      sourcemap: true
    },
    plugins: getPlugins().concat([uglify()])
  },
  {
    input: "src/pure-cache.js",
    external: ["mitt"],
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true
      },
      {
        file: pkg.module,
        format: "es",
        sourcemap: true
      }
    ],
    plugins: getPlugins()
  }
];
