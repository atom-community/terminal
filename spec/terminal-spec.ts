import { getInstance, TerminalPackage } from "../src/terminal"
import { AtomTerminal } from "../src/element"

describe("terminal", () => {
  let terminal: TerminalPackage

  beforeEach(() => {
    terminal = getInstance()
  })

  describe("unfocus()", () => {
    it("focuses atom-workspace", async () => {
      // @ts-ignore
      jasmine.attachToDOM(atom.views.getView(atom.workspace))
      const model = await terminal.openInCenterOrDock(atom.workspace)
      await model.initializedPromise
      await (model.element as AtomTerminal).createTerminal()

      // @ts-ignore
      expect(model.element).toHaveFocus()
      terminal.unfocus()
      // @ts-ignore
      expect(model.element).not.toHaveFocus()
    })
  })

  describe("runCommands()", () => {
    let activeTerminal: any, newTerminal: any, commands: any
    beforeEach(() => {
      activeTerminal = {
        element: {
          initializedPromise: Promise.resolve(),
        },
        runCommand: jasmine.createSpy("activeTerminal.runCommand"),
      }
      newTerminal = {
        element: {
          initializedPromise: Promise.resolve(),
        },
        runCommand: jasmine.createSpy("newTerminal.runCommand"),
      }
      commands = ["command 1", "command 2"]
      spyOn(terminal, "getActiveTerminal").and.returnValue(activeTerminal)
      spyOn(terminal, "open").and.returnValue(newTerminal)
    })

    it("runs commands in new terminal", async () => {
      atom.config.set("terminal.runInActive", false)
      await terminal.runCommands(commands)

      expect(terminal.getActiveTerminal).not.toHaveBeenCalled()
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 1")
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 2")
    })

    it("runs commands in active terminal", async () => {
      atom.config.set("terminal.runInActive", true)
      await terminal.runCommands(commands)

      expect(terminal.open).not.toHaveBeenCalled()
      expect(activeTerminal.runCommand).toHaveBeenCalledWith("command 1")
      expect(activeTerminal.runCommand).toHaveBeenCalledWith("command 2")
    })

    it("runs commands in new terminal if none active", async () => {
      (terminal.getActiveTerminal as jasmine.Spy).and.returnValue(undefined)
      atom.config.set("terminal.runInActive", true)
      await terminal.runCommands(commands)

      expect(terminal.getActiveTerminal).toHaveBeenCalled()
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 1")
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 2")
    })
  })
})
