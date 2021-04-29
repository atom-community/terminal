/** @babel */

import { getDefaultShell, setAutoShell } from "../dist/config"

describe("config", () => {
  describe("getDefaultShell()", () => {
    const savedPlatform = process.platform
    let savedEnv

    beforeEach(() => {
      savedEnv = JSON.parse(JSON.stringify(process.env))
    })

    afterEach(() => {
      process.env = savedEnv
      Object.defineProperty(process, "platform", {
        value: savedPlatform,
      })
    })

    it("on win32 without COMSPEC set", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
      })
      if (process.env.COMSPEC) {
        delete process.env.COMSPEC
      }
      expect(getDefaultShell()).toBe("cmd.exe")
    })

    it("on win32 with COMSPEC set", () => {
      Object.defineProperty(process, "platform", {
        value: "win32",
      })
      const expected = "somecommand.exe"
      process.env.COMSPEC = expected
      expect(getDefaultShell()).toBe(expected)
    })

    it("on linux without SHELL set", () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
      })
      if (process.env.SHELL) {
        delete process.env.SHELL
      }
      expect(getDefaultShell()).toBe("/bin/sh")
    })

    it("on linux with SHELL set", () => {
      Object.defineProperty(process, "platform", {
        value: "linux",
      })
      const expected = "somecommand"
      process.env.SHELL = expected
      expect(getDefaultShell()).toBe(expected)
    })
  })

  describe("setAutoShell()", () => {
    const savedPlatform = process.platform

    beforeEach(() => {
      Object.defineProperty(process, "platform", {
        value: "win32",
      })
      atom.config.set("atomic-terminal.shell", getDefaultShell())
    })

    afterEach(() => {
      Object.defineProperty(process, "platform", {
        value: savedPlatform,
      })
    })

    it("should set terminal.shell to pwsh", async () => {
      const shell = "path/to/pwsh.exe"
      await setAutoShell(async (file) => {
        if (file === "pwsh.exe") {
          return shell
        }
        throw new Error("ENOENT")
      })

      expect(atom.config.get("atomic-terminal.shell")).toBe(shell)
    })

    it("should set terminal.shell to powershell", async () => {
      const shell = "path/to/powershell.exe"
      await setAutoShell(async (file) => {
        if (file === "powershell.exe") {
          return shell
        }
        throw new Error("ENOENT")
      })

      expect(atom.config.get("atomic-terminal.shell")).toBe(shell)
    })

    it("should set terminal.shell to powershell", async () => {
      const shell = getDefaultShell()
      await setAutoShell(async () => {
        throw new Error("ENOENT")
      })

      expect(atom.config.get("atomic-terminal.shell")).toBe(shell)
    })
  })
})
