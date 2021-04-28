/** @babel */

import * as nodePty from "node-pty-prebuilt-multiarch"
import { shell } from "electron"

import { config } from "../dist/config"
import { getTheme } from "../dist/themes"
import { TerminalElement } from "../dist/element"
import { TerminalModel } from "../dist/model"

import path from "path"
import temp from "temp"

temp.track()

describe("TerminalElement", () => {
  const savedPlatform = process.platform
  let element, tmpdir

  const createNewElement = async (uri = "terminal://somesessionid/") => {
    const terminalsSet = new Set()
    const model = new TerminalModel({
      uri: uri,
      terminalsSet: terminalsSet,
    })
    await model.initializedPromise
    model.pane = jasmine.createSpyObj("pane", ["removeItem", "getActiveItem", "destroyItem"])
    const terminalElement = new TerminalElement()
    await terminalElement.initialize(model)
    await terminalElement.createTerminal()
    return terminalElement
  }

  beforeEach(async () => {
    const ptyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    ptyProcess.process = jasmine.createSpy("process").and.returnValue("sometestprocess")
    spyOn(nodePty, "spawn").and.returnValue(ptyProcess)
    spyOn(shell, "openExternal")
    element = await createNewElement()
    tmpdir = await temp.mkdir()
  })

  afterEach(async () => {
    element.destroy()
    Object.defineProperty(process, "platform", {
      value: savedPlatform,
    })
    await temp.cleanup()
  })

  it("initialize(model)", () => {
    // Simply test if the terminal has been created.
    expect(element.terminal).toBeTruthy()
  })

  it("initialize(model) check session-id", () => {
    expect(element.getAttribute("session-id")).toBe("somesessionid")
  })

  it("destroy() check ptyProcess killed", () => {
    element.destroy()
    expect(element.ptyProcess.kill).toHaveBeenCalled()
  })

  it("destroy() check terminal destroyed", () => {
    spyOn(element.terminal, "dispose").and.callThrough()
    element.destroy()
    expect(element.terminal.dispose).toHaveBeenCalled()
  })

  it("destroy() check disposables disposed", () => {
    spyOn(element.disposables, "dispose").and.callThrough()
    element.destroy()
    expect(element.disposables.dispose).toHaveBeenCalled()
  })

  it("checkPathIsDirectory() no path given", async () => {
    const isDirectory = await element.checkPathIsDirectory()
    expect(isDirectory).toBe(false)
  })

  it("checkPathIsDirectory() path set to undefined", async () => {
    const isDirectory = await element.checkPathIsDirectory(undefined)
    expect(isDirectory).toBe(false)
  })

  it("checkPathIsDirectory() path set to null", async () => {
    const isDirectory = await element.checkPathIsDirectory(null)
    expect(isDirectory).toBe(false)
  })

  it("checkPathIsDirectory() path set to tmpdir", async () => {
    const isDirectory = await element.checkPathIsDirectory(tmpdir)
    expect(isDirectory).toBe(true)
  })

  it("checkPathIsDirectory() path set to non-existent dir", async () => {
    const isDirectory = await element.checkPathIsDirectory(path.join(tmpdir, "non-existent-dir"))
    expect(isDirectory).toBe(false)
  })

  it("getCwd()", async () => {
    element.model.cwd = tmpdir
    const cwd = await element.getCwd()
    expect(cwd).toBe(element.model.cwd)
  })

  it("createTerminal() check terminal object", () => {
    expect(element.terminal).toBeTruthy()
  })

  it("createTerminal() check ptyProcess object", () => {
    expect(element.ptyProcess).toBeTruthy()
  })

  describe("loaded addons", () => {
    const { Terminal } = require("xterm")
    const { WebLinksAddon } = require("xterm-addon-web-links")
    const { WebglAddon } = require("xterm-addon-webgl")

    beforeEach(() => {
      spyOn(Terminal.prototype, "loadAddon").and.callThrough()
    })

    it("createTerminal() enable web-link addon", async () => {
      atom.config.set("terminal.webLinks", true)
      await createNewElement()
      const wasAdded = Terminal.prototype.loadAddon.calls.all().some((call) => {
        return call.args[0] instanceof WebLinksAddon
      })
      expect(wasAdded).toBe(true)
    })

    it("createTerminal() disable web-link addon", async () => {
      atom.config.set("terminal.webLinks", false)
      await createNewElement()
      const wasAdded = Terminal.prototype.loadAddon.calls.all().some((call) => {
        return call.args[0] instanceof WebLinksAddon
      })
      expect(wasAdded).toBe(false)
    })

    if (process.platform !== "linux") {
      it("createTerminal() enable webgl addon", async () => {
        atom.config.set("terminal.webgl", true)
        await createNewElement()
        const wasAdded = Terminal.prototype.loadAddon.calls.all().some((call) => {
          return call.args[0] instanceof WebglAddon
        })
        expect(wasAdded).toBe(true)
      })
    }

    it("createTerminal() disable webgl addon", async () => {
      atom.config.set("terminal.webgl", false)
      await createNewElement()
      const wasAdded = Terminal.prototype.loadAddon.calls.all().some((call) => {
        return call.args[0] instanceof WebglAddon
      })
      expect(wasAdded).toBe(false)
    })
  })

  it("restartPtyProcess() check new pty process created", async () => {
    const oldPtyProcess = element.ptyProcess
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = jasmine.createSpy("process").and.returnValue("sometestprocess")
    nodePty.spawn.and.returnValue(newPtyProcess)
    await element.restartPtyProcess()
    expect(element.ptyProcess).toBe(newPtyProcess)
    expect(oldPtyProcess).not.toBe(element.ptyProcess)
  })

  it("restartPtyProcess() check ptyProcessRunning set to true", async () => {
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = jasmine.createSpy("process").and.returnValue("sometestprocess")
    nodePty.spawn.and.returnValue(newPtyProcess)
    await element.restartPtyProcess()
    expect(element.ptyProcessRunning).toBe(true)
  })

  it("restartPtyProcess() command not found", async () => {
    spyOn(atom.notifications, "addError")
    atom.config.set("terminal.shell", "somecommand")
    const fakeCall = () => {
      throw Error("File not found: somecommand")
    }
    nodePty.spawn.and.callFake(fakeCall)
    await element.restartPtyProcess()
    expect(element.ptyProcess).toBe(undefined)
    expect(element.ptyProcessRunning).toBe(false)
    expect(atom.notifications.addError).toHaveBeenCalledWith("Terminal Error", {
      detail: "Could not open shell 'somecommand'.",
    })
  })

  it("restartPtyProcess() some other error thrown", async () => {
    spyOn(atom.notifications, "addError")
    atom.config.set("terminal.shell", "somecommand")
    const fakeCall = () => {
      throw Error("Something went wrong")
    }
    nodePty.spawn.and.callFake(fakeCall)
    await element.restartPtyProcess()
    expect(element.ptyProcess).toBe(undefined)
    expect(element.ptyProcessRunning).toBe(false)
    expect(atom.notifications.addError).toHaveBeenCalledWith("Terminal Error", {
      detail: "Launching 'somecommand' raised the following error: Something went wrong",
    })
  })

  it("ptyProcess exit handler set ptyProcessRunning to false", () => {
    let exitHandler
    for (const arg of element.ptyProcess.on.calls.allArgs()) {
      if (arg[0] === "exit") {
        exitHandler = arg[1]
        break
      }
    }
    spyOn(element.model, "exit")
    exitHandler(0)
    expect(element.ptyProcessRunning).toBe(false)
  })

  it("ptyProcess exit handler code 0 don't leave open", () => {
    let exitHandler
    for (const arg of element.ptyProcess.on.calls.allArgs()) {
      if (arg[0] === "exit") {
        exitHandler = arg[1]
        break
      }
    }
    spyOn(element.model, "exit")
    exitHandler(0)
    expect(element.model.exit).toHaveBeenCalled()
  })

  it("ptyProcess exit handler code 1 don't leave open", () => {
    let exitHandler
    for (const arg of element.ptyProcess.on.calls.allArgs()) {
      if (arg[0] === "exit") {
        exitHandler = arg[1]
        break
      }
    }
    spyOn(element.model, "exit")
    exitHandler(1)
    expect(element.model.exit).toHaveBeenCalled()
  })

  it("refitTerminal() initial state", () => {
    spyOn(element.fitAddon, "proposeDimensions")
    element.refitTerminal()
    expect(element.fitAddon.proposeDimensions).not.toHaveBeenCalled()
  })

  it("refitTerminal() terminal not visible", () => {
    spyOn(element.fitAddon, "proposeDimensions")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = false
    element.refitTerminal()
    expect(element.fitAddon.proposeDimensions).not.toHaveBeenCalled()
  })

  it("refitTerminal() terminal no width", () => {
    spyOn(element.fitAddon, "proposeDimensions")
    element.contentRect = { width: 0, height: 1 }
    element.initiallyVisible = true
    element.refitTerminal()
    expect(element.fitAddon.proposeDimensions).not.toHaveBeenCalled()
  })

  it("refitTerminal() terminal no height", () => {
    spyOn(element.fitAddon, "proposeDimensions")
    element.contentRect = { width: 1, height: 0 }
    element.initiallyVisible = true
    element.refitTerminal()
    expect(element.fitAddon.proposeDimensions).not.toHaveBeenCalled()
  })

  it("refitTerminal() terminal completely visible", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(null)
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.refitTerminal()
    expect(element.fitAddon.proposeDimensions).toHaveBeenCalled()
  })

  it("refitTerminal() terminal size not changed", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols,
      rows: element.terminal.rows,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).not.toHaveBeenCalled()
  })

  it("refitTerminal() terminal size cols increased", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols + 1,
      rows: element.terminal.rows,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).toHaveBeenCalled()
  })

  it("refitTerminal() terminal size rows increased", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols,
      rows: element.terminal.rows + 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).toHaveBeenCalled()
  })

  it("refitTerminal() terminal size cols and rows increased", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols + 1,
      rows: element.terminal.rows + 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).toHaveBeenCalled()
  })

  it("refitTerminal() terminal size rows decreased", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols,
      rows: element.terminal.rows - 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).toHaveBeenCalled()
  })

  it("refitTerminal() terminal size cols and rows decreased", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.terminal.cols - 1,
      rows: element.terminal.rows - 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = false
    element.refitTerminal()
    expect(element.terminal.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size not changed ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols,
      rows: element.ptyProcessRows,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).not.toHaveBeenCalled()
  })

  it("refitTerminal() pty process size cols increased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols + 1,
      rows: element.ptyProcessRows,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size rows increased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols,
      rows: element.ptyProcessRows + 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size cols and rows increased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols + 1,
      rows: element.ptyProcessRows + 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size cols decreased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols - 1,
      rows: element.ptyProcessRows,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size rows decreased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols,
      rows: element.ptyProcessRows - 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size cols and rows decreased ptyProcess running", () => {
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue({
      cols: element.ptyProcessCols - 1,
      rows: element.ptyProcessRows - 1,
    })
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalled()
  })

  it("refitTerminal() pty process size cols increased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols + 1,
      rows: element.ptyProcessRows,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("refitTerminal() pty process size rows increased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols,
      rows: element.ptyProcessRows + 1,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("refitTerminal() pty process size cols and rows increased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols + 1,
      rows: element.ptyProcessRows + 1,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("refitTerminal() pty process size cols decreased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols - 1,
      rows: element.ptyProcessRows,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("refitTerminal() pty process size rows decreased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols,
      rows: element.ptyProcessRows - 1,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("refitTerminal() pty process size cols and rows decreased ptyProcess running check call args", () => {
    const expected = {
      cols: element.ptyProcessCols - 1,
      rows: element.ptyProcessRows - 1,
    }
    spyOn(element.fitAddon, "proposeDimensions").and.returnValue(expected)
    spyOn(element.terminal, "resize")
    element.contentRect = { width: 1, height: 1 }
    element.initiallyVisible = true
    element.ptyProcessRunning = true
    element.refitTerminal()
    expect(element.ptyProcess.resize).toHaveBeenCalledWith(expected.cols, expected.rows)
  })

  it("focusOnTerminal()", () => {
    spyOn(element.terminal, "focus")
    spyOn(element.model, "setActive")
    element.focusOnTerminal()
    expect(element.model.setActive).toHaveBeenCalled()
    expect(element.terminal.focus).toHaveBeenCalled()
  })

  it("focusOnTerminal() terminal not set", () => {
    element.terminal = null
    element.focusOnTerminal()
  })

  it("on 'data' handler no custom title on win32 platform", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    })
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = "sometestprocess"
    nodePty.spawn.and.returnValue(newPtyProcess)
    await element.restartPtyProcess()
    const args = element.ptyProcess.on.calls.argsFor(0)
    const onDataCallback = args[1]
    onDataCallback("")
    expect(element.model.title).toBe("Terminal")
  })

  it("on 'data' handler no custom title on linux platform", async () => {
    Object.defineProperty(process, "platform", {
      value: "linux",
    })
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = "sometestprocess"
    nodePty.spawn.and.returnValue(newPtyProcess)
    await element.restartPtyProcess()
    const args = element.ptyProcess.on.calls.argsFor(0)
    const onDataCallback = args[1]
    onDataCallback("")
    expect(element.model.title).toBe("sometestprocess")
  })

  it("on 'data' handler custom title on win32 platform", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    })
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = "sometestprocess"
    nodePty.spawn.and.returnValue(newPtyProcess)
    element.model.title = "foo"
    await element.restartPtyProcess()
    const args = element.ptyProcess.on.calls.argsFor(0)
    const onDataCallback = args[1]
    onDataCallback("")
    expect(element.model.title).toBe("foo")
  })

  it("on 'data' handler custom title on linux platform", async () => {
    Object.defineProperty(process, "platform", {
      value: "linux",
    })
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = "sometestprocess"
    nodePty.spawn.and.returnValue(newPtyProcess)
    element.model.title = "foo"
    await element.restartPtyProcess()
    const args = element.ptyProcess.on.calls.argsFor(0)
    const onDataCallback = args[1]
    onDataCallback("")
    expect(element.model.title).toBe("sometestprocess")
  })

  it("on 'exit' handler", async () => {
    const newPtyProcess = jasmine.createSpyObj("ptyProcess", ["kill", "write", "resize", "on", "removeAllListeners"])
    newPtyProcess.process = "sometestprocess"
    nodePty.spawn.and.returnValue(newPtyProcess)
    element.model.title = "foo"
    await element.restartPtyProcess()
    const args = element.ptyProcess.on.calls.argsFor(1)
    const onExitCallback = args[1]
    spyOn(element.model, "exit")
    onExitCallback(1)
    expect(element.model.exit).toHaveBeenCalled()
  })

  it("use wheelScrollUp on terminal container", () => {
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -150,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(14)
  })

  it("use wheelScrollDown on terminal container", () => {
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: 150,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(14)
  })

  it("use ctrl+wheelScrollUp on terminal container, editor.zoomFontWhenCtrlScrolling = true", () => {
    atom.config.set("editor.zoomFontWhenCtrlScrolling", true)
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(15)
  })

  it("use ctrl+wheelScrollDown on terminal container, editor.zoomFontWhenCtrlScrolling = true", () => {
    atom.config.set("editor.zoomFontWhenCtrlScrolling", true)
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: 150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(13)
  })

  it("use ctrl+wheelScrollUp on terminal container, editor.zoomFontWhenCtrlScrolling = false", () => {
    atom.config.set("editor.zoomFontWhenCtrlScrolling", false)
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(14)
  })

  it("use ctrl+wheelScrollDown on terminal container, editor.zoomFontWhenCtrlScrolling = false", () => {
    atom.config.set("editor.zoomFontWhenCtrlScrolling", false)
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: 150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(14)
  })

  it("use ctrl+wheelScrollUp font already at maximum", () => {
    element.model.fontSize = config.fontSize.maximum
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: -150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(config.fontSize.maximum)
  })

  it("use ctrl+wheelScrollDown font already at minimum", () => {
    element.model.fontSize = config.fontSize.minimum
    const wheelEvent = new WheelEvent("wheel", {
      deltaY: 150,
      ctrlKey: true,
    })
    element.dispatchEvent(wheelEvent)
    expect(element.model.fontSize).toBe(config.fontSize.minimum)
  })

  it("copy on select", async () => {
    spyOn(atom.clipboard, "write")
    atom.config.set("terminal.copyOnSelect", true)
    await new Promise((resolve) => element.terminal.write("test", resolve))
    element.terminal.selectLines(0, 0)
    const selection = element.terminal.getSelection()
    expect(atom.clipboard.write).toHaveBeenCalledWith(selection)
  })

  it("does not copy on clear selection", async () => {
    spyOn(atom.clipboard, "write")
    atom.config.set("terminal.copyOnSelect", true)
    await new Promise((resolve) => element.terminal.write("test", resolve))
    element.terminal.selectLines(0, 0)
    atom.clipboard.write.calls.reset()
    element.terminal.clearSelection()
    expect(atom.clipboard.write).not.toHaveBeenCalled()
  })

  it("does not copy if copyOnSelect is false", async () => {
    spyOn(atom.clipboard, "write")
    atom.config.set("terminal.copyOnSelect", false)
    await new Promise((resolve) => element.terminal.write("test", resolve))
    element.terminal.selectLines(0, 0)
    expect(atom.clipboard.write).not.toHaveBeenCalled()
  })

  it("getXtermOptions() default options", () => {
    const expected = {
      cursorBlink: true,
      fontSize: atom.config.get("editor.fontSize"),
      fontFamily: atom.config.get("editor.fontFamily"),
      theme: getTheme(),
    }
    expect(element.getXtermOptions()).toEqual(expected)
  })

  it("getXtermOptions() fontSize changed", () => {
    atom.config.set("terminal.fontSize", 8)
    const expected = {
      cursorBlink: true,
      fontSize: 8,
      fontFamily: atom.config.get("editor.fontFamily"),
      theme: getTheme(),
    }
    expect(element.getXtermOptions()).toEqual(expected)
  })

  it("getXtermOptions() fontFamily changed", () => {
    atom.config.set("terminal.fontFamily", "serif")
    const expected = {
      cursorBlink: true,
      fontSize: atom.config.get("editor.fontSize"),
      fontFamily: "serif",
      theme: getTheme(),
    }
    expect(element.getXtermOptions()).toEqual(expected)
  })

  it("getXtermOptions() theme changed", () => {
    atom.config.set("terminal.colors.theme", "Red")
    const expected = {
      cursorBlink: true,
      fontSize: atom.config.get("editor.fontSize"),
      fontFamily: atom.config.get("editor.fontFamily"),
      theme: getTheme(),
    }
    expect(element.getXtermOptions()).toEqual(expected)
  })

  it("clear terminal", () => {
    spyOn(element.terminal, "clear")
    element.clear()
    expect(element.terminal.clear).toHaveBeenCalled()
  })
})
