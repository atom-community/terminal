import { createPlugins } from "rollup-plugin-atomic"

const plugins = createPlugins(["ts", "js"])

export default [
  {
    input: "src/terminal.ts",
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
      },
    ],
    // loaded externally
    external: ["atom", "electron", "node-pty-prebuilt-multiarch"],
    plugins: plugins,
  },
]
