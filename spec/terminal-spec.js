/** @babel */

import { getInstance } from "../dist/terminal"

describe("terminal", () => {
  let terminal

  beforeEach(() => {
    terminal = getInstance()
  })

  describe("unfocus()", () => {
    it("focuses atom-workspace", async () => {
      jasmine.attachToDOM(atom.views.getView(atom.workspace))
      const model = await terminal.openInCenterOrDock(atom.workspace)
      await model.initializedPromise
      await model.element.createTerminal()

      expect(model.element).toHaveFocus()
      terminal.unfocus()
      expect(model.element).not.toHaveFocus()
    })
  })

  describe("runCommands()", () => {
    let activeTerminal, newTerminal, commands
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
      terminal.getActiveTerminal.and.returnValue()
      atom.config.set("terminal.runInActive", true)
      await terminal.runCommands(commands)

      expect(terminal.getActiveTerminal).toHaveBeenCalled()
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 1")
      expect(newTerminal.runCommand).toHaveBeenCalledWith("command 2")
    })
  })

	describe('open()', () => {
		let uri
		beforeEach(() => {
			uri = terminal.generateNewUri()
			spyOn(atom.workspace, 'open')
		})

		it('simple', async () => {
			await terminal.open(uri)

			expect(atom.workspace.open).toHaveBeenCalledWith(uri, {})
		})

		it('target to cwd', async () => {
			const testPath = '/test/path'
			spyOn(terminal, 'getPath').and.returnValue(testPath)
			await terminal.open(
				uri,
				{ target: true },
			)

			const url = new URL(atom.workspace.open.calls.mostRecent().args[0])

			expect(url.searchParams.get('cwd')).toBe(testPath)
		})
	})
})
