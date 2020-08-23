/** @babel */

import { execSync } from "child_process"
import { createRunner } from "atom-jasmine3-test-runner"

function setDefaultSettings(namespace, settings) {
  for (const name in settings) {
    const setting = settings[name]
    if (setting.type === "object") {
      setDefaultSettings(`${namespace}.${name}`, setting.properties)
    } else {
      atom.config.set(`${namespace}.${name}`, setting.default)
    }
  }
}

execSync("npm run tsc", { cwd: __dirname })

module.exports = createRunner(
  {
    specHelper: {
      attachToDom: true,
      customMatchers: true,
    },
  },
  () => {
    // eslint-disable-next-line no-console
    const warn = console.warn.bind(console)
    beforeEach(() => {
      const { config } = require("../dist/config")
      setDefaultSettings("terminal", config)
      spyOn(console, "warn").and.callFake((...args) => {
        if (args[0].includes("not attached to the DOM")) {
          return
        }
        warn(...args)
      })
    })
  }
)
