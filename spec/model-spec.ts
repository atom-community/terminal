import { TerminalModel } from "../src/model"

import { Pane } from "atom"
import fs from "fs-extra"
import path from "path"
// @ts-ignore
import temp from "temp"

temp.track()

describe("TerminalModel", () => {
  let model: TerminalModel, pane: Pane, element: any, tmpdir: string, uri: string, terminalsSet: Set<TerminalModel>

  beforeEach(async () => {
    uri = "terminal://somesessionid/"
    terminalsSet = new Set()
    model = new TerminalModel({ uri, terminalsSet })
    await model.initializedPromise
    pane = jasmine.createSpyObj("pane", ["destroyItem", "getActiveItem"])
    element = jasmine.createSpyObj("element", [
      "destroy",
      "refitTerminal",
      "focusOnTerminal",
      "clickOnCurrentAnchor",
      "getCurrentAnchorHref",
      "restartPtyProcess",
    ])
    element.terminal = jasmine.createSpyObj("terminal", ["getSelection"])
    element.ptyProcess = jasmine.createSpyObj("ptyProcess", ["write"])
    tmpdir = await temp.mkdir()
  })

  afterEach(async () => {
    await temp.cleanup()
  })

  it("constructor with previous active item that has no getPath() method", async () => {
    atom.project.setPaths([tmpdir])
    spyOn(atom.workspace, "getActivePaneItem").and.returnValue({})
    const newModel = new TerminalModel({
      uri,
      terminalsSet,
    })
    await newModel.initializedPromise
    expect(newModel.getPath()).toBe(tmpdir)
  })

  it("constructor with previous active item that has getPath() method", async () => {
    const previousActiveItem = jasmine.createSpyObj("somemodel", ["getPath"])
    previousActiveItem.getPath.and.returnValue(tmpdir)
    spyOn(atom.workspace, "getActivePaneItem").and.returnValue(previousActiveItem)
    const newModel = new TerminalModel({
      uri,
      terminalsSet,
    })
    await newModel.initializedPromise
    expect(newModel.getPath()).toBe(tmpdir)
  })

  it("constructor with previous active item that has getPath() method returns file path", async () => {
    const previousActiveItem = jasmine.createSpyObj("somemodel", ["getPath"])
    const filePath = path.join(tmpdir, "somefile")
    await fs.writeFile(filePath, "")
    previousActiveItem.getPath.and.returnValue(filePath)
    spyOn(atom.workspace, "getActivePaneItem").and.returnValue(previousActiveItem)
    const newModel = new TerminalModel({
      uri,
      terminalsSet,
    })
    await newModel.initializedPromise
    expect(newModel.getPath()).toBe(tmpdir)
  })

  it("constructor with previous active item that has getPath() returning invalid path", async () => {
    const dirPath = path.join(tmpdir, "dir")
    await fs.mkdir(dirPath)
    atom.project.setPaths([dirPath])
    const previousActiveItem = jasmine.createSpyObj("somemodel", ["getPath"])
    previousActiveItem.getPath.and.returnValue(path.join(tmpdir, "non-existent-dir"))
    spyOn(atom.workspace, "getActivePaneItem").and.returnValue(previousActiveItem)
    const newModel = new TerminalModel({
      uri,
      terminalsSet,
    })
    await newModel.initializedPromise
    expect(newModel.getPath()).toBe(dirPath)
  })

  it("constructor with previous active item which exists in project path", async () => {
    const previousActiveItem = jasmine.createSpyObj("somemodel", ["getPath"])
    spyOn(atom.workspace, "getActivePaneItem").and.returnValue(previousActiveItem)
    const expected: any = ["/some/dir", null]
    spyOn(atom.project, "relativizePath").and.returnValue(expected)
    const newModel = new TerminalModel({
      uri,
      terminalsSet,
    })
    await newModel.initializedPromise
    expect(newModel.getPath()).toBe(expected[0])
  })

  it("serialize()", async () => {
    expect(model.serialize()).toEqual({
      deserializer: "TerminalModel",
      version: "1.0.0",
      uri,
    })
  })

  it("destroy() check element is destroyed when set", () => {
    model.element = element
    model.destroy()
    // @ts-ignore
    expect(model.element.destroy).toHaveBeenCalled()
  })

  it("destroy() check model removed from terminalsSet", () => {
    expect(terminalsSet.has(model)).toBe(true)
    model.destroy()
    expect(terminalsSet.has(model)).toBe(false)
  })

  it("getTitle() with default title", () => {
    expect(model.getTitle()).toBe("Terminal")
  })

  it("getTitle() with new title", () => {
    const expected = "some new title"
    model.title = expected
    expect(model.getTitle()).toBe(expected)
  })

  it("getTitle() when active", () => {
    spyOn(model, "isActiveTerminal").and.returnValue(true)
    expect(model.getTitle()).toBe("* Terminal")
  })

  it("getElement()", () => {
    const expected = { somekey: "somevalue" }
    // @ts-ignore
    model.element = expected
    // @ts-ignore
    expect(model.getElement()).toBe(expected)
  })

  it("getURI()", async () => {
    expect(model.getURI()).toBe(uri)
  })

  it("getLongTitle() with default title", () => {
    expect(model.getLongTitle()).toBe("Terminal")
  })

  it("getLongTitle() with new title", () => {
    const expected = "Terminal (some new title)"
    model.title = "some new title"
    expect(model.getLongTitle()).toBe(expected)
  })

  it("onDidChangeTitle()", () => {
    const spy = jasmine.createSpy("spy")
    const disposable = model.onDidChangeTitle(spy)
    const expected = "new title"
    model.emitter.emit("did-change-title", expected)
    expect(spy).toHaveBeenCalledWith(expected)
    disposable.dispose()
  })

  it("getIconName()", () => {
    expect(model.getIconName()).toBe("terminal")
  })

  it("isModified()", () => {
    expect(model.isModified()).toBe(false)
  })

  it("isModified() modified attribute set to true", () => {
    model.modified = true
    expect(model.isModified()).toBe(true)
  })

  it("getPath() cwd set", () => {
    const expected = "/some/dir"
    model.cwd = expected
    expect(model.getPath()).toBe(expected)
  })

  it("onDidChangeModified()", () => {
    const spy = jasmine.createSpy("spy")
    const disposable = model.onDidChangeModified(spy)
    const expected = true
    model.emitter.emit("did-change-modified", expected)
    expect(spy).toHaveBeenCalledWith(expected)
    disposable.dispose()
  })

  it("handleNewDataArrival() current item is active item", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue(model)
    model.pane = pane
    model.handleNewDataArrival()
    expect(model.modified).toBe(false)
  })

  it("handleNewDataArrival() current item is not active item", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue({})
    model.pane = pane
    model.handleNewDataArrival()
    expect(model.modified).toBe(true)
  })

  it("handleNewDataArrival() current item is not in any pane", () => {
    model.pane = undefined
    model.handleNewDataArrival()
    expect(model.modified).toBe(true)
  })

  it("handleNewDataArrival() model initially has no pane set", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue({})
    spyOn(atom.workspace, "paneForItem").and.returnValue(pane)
    model.handleNewDataArrival()
    expect(atom.workspace.paneForItem).toHaveBeenCalled()
  })

  it("handleNewDataArrival() modified value of false not changed", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue(model)
    model.pane = pane
    spyOn(model.emitter, "emit")
    model.handleNewDataArrival()
    expect(model.emitter.emit).toHaveBeenCalledTimes(0)
  })

  it("handleNewDataArrival() modified value of true not changed", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue({})
    model.pane = pane
    model.modified = true
    spyOn(model.emitter, "emit")
    model.handleNewDataArrival()
    expect(model.emitter.emit).toHaveBeenCalledTimes(0)
  })

  it("handleNewDataArrival() modified value changed", () => {
    ;(pane.getActiveItem as jasmine.Spy).and.returnValue({})
    model.pane = pane
    spyOn(model.emitter, "emit")
    model.handleNewDataArrival()
    expect(model.emitter.emit).toHaveBeenCalled()
  })

  it("getSessionId()", async () => {
    expect(model.getSessionId()).toBe("somesessionid")
  })

  it("refitTerminal() without element set", () => {
    // Should just work.
    model.refitTerminal()
  })

  it("refitTerminal() with element set", () => {
    model.element = element
    model.refitTerminal()
    expect(model.element!.refitTerminal).toHaveBeenCalled()
  })

  it("focusOnTerminal()", () => {
    model.element = element
    model.focusOnTerminal()
    expect(model.element!.focusOnTerminal).toHaveBeenCalled()
  })

  it("focusOnTerminal() reset modified value old modified value was false", () => {
    model.element = element
    model.focusOnTerminal()
    expect(model.modified).toBe(false)
  })

  it("focusOnTerminal() reset modified value old modified value was true", () => {
    model.element = element
    model.modified = true
    model.focusOnTerminal()
    expect(model.modified).toBe(false)
  })

  it("focusOnTerminal() no event emitted old modified value was false", () => {
    model.element = element
    spyOn(model.emitter, "emit")
    model.focusOnTerminal()
    expect(model.emitter.emit).toHaveBeenCalledTimes(0)
  })

  it("focusOnTerminal() event emitted old modified value was true", () => {
    model.element = element
    model.modified = true
    spyOn(model.emitter, "emit")
    model.focusOnTerminal()
    expect(model.emitter.emit).toHaveBeenCalled()
  })

  it("exit()", () => {
    model.pane = pane
    model.exit()
    expect((model.pane.destroyItem as jasmine.Spy).calls.allArgs()).toEqual([[model, true]])
  })

  it("restartPtyProcess() no element set", () => {
    model.restartPtyProcess()
    expect(element.restartPtyProcess).not.toHaveBeenCalled()
  })

  it("restartPtyProcess() element set", () => {
    model.element = element
    model.restartPtyProcess()
    expect(model.element!.restartPtyProcess).toHaveBeenCalled()
  })

  it("copyFromTerminal()", () => {
    model.element = element
    model.copyFromTerminal()
    expect(model.element!.terminal!.getSelection).toHaveBeenCalled()
  })

  it("runCommand(cmd)", () => {
    model.element = element
    const expectedText = "some text"
    model.runCommand(expectedText)
    expect((model.element!.ptyProcess!.write as jasmine.Spy).calls.allArgs()).toEqual([
      [expectedText + (process.platform === "win32" ? "\r" : "\n")],
    ])
  })

  it("pasteToTerminal(text)", () => {
    model.element = element
    const expectedText = "some text"
    model.pasteToTerminal(expectedText)
    expect((model.element!.ptyProcess!.write as jasmine.Spy).calls.allArgs()).toEqual([[expectedText]])
  })

  it("setActive()", async function () {
    const activePane = atom.workspace.getCenter().getActivePane()
    const newTerminalsSet: Set<TerminalModel> = new Set()
    const model1 = new TerminalModel({
      uri: uri,
      terminalsSet: newTerminalsSet,
    })
    await model1.initializedPromise
    activePane.addItem(model1)
    model1.setNewPane(activePane)
    const model2 = new TerminalModel({
      uri: uri,
      terminalsSet: newTerminalsSet,
    })
    await model2.initializedPromise
    activePane.addItem(model2)
    model2.setNewPane(activePane)
    expect(model1.activeIndex).toBe(0)
    expect(model2.activeIndex).toBe(1)
    model2.setActive()
    expect(model1.activeIndex).toBe(1)
    expect(model2.activeIndex).toBe(0)
  })

  describe("setNewPane", () => {
    it("(mock)", async () => {
      const expected: any = { getContainer: () => ({ getLocation: () => {} }) }
      model.setNewPane(expected)
      expect(model.pane).toBe(expected)
      expect(model.dock).toBe(undefined)
    })

    it("(center)", async () => {
      const activePane = atom.workspace.getCenter().getActivePane()
      model.setNewPane(activePane)
      expect(model.pane).toBe(activePane)
      expect(model.dock).toBe(undefined)
    })

    it("(left)", async () => {
      const dock = atom.workspace.getLeftDock()
      const activePane = dock.getActivePane()
      model.setNewPane(activePane)
      expect(model.pane).toBe(activePane)
      expect(model.dock).toBe(dock)
    })

    it("(right)", async () => {
      const dock = atom.workspace.getRightDock()
      const activePane = dock.getActivePane()
      model.setNewPane(activePane)
      expect(model.pane).toBe(activePane)
      expect(model.dock).toBe(dock)
    })

    it("(bottom)", async () => {
      const dock = atom.workspace.getBottomDock()
      const activePane = dock.getActivePane()
      model.setNewPane(activePane)
      expect(model.pane).toBe(activePane)
      expect(model.dock).toBe(dock)
    })
  })

  it("isVisible() in pane", () => {
    const activePane = atom.workspace.getCenter().getActivePane()
    model.setNewPane(activePane)
    expect(model.isVisible()).toBe(false)
    // @ts-ignore
    activePane.setActiveItem(model)
    expect(model.isVisible()).toBe(true)
  })

  it("isVisible() in dock", () => {
    const dock = atom.workspace.getBottomDock()
    const activePane = dock.getActivePane()
    model.setNewPane(activePane)
    // @ts-ignore
    activePane.setActiveItem(model)
    expect(model.isVisible()).toBe(false)
    dock.show()
    expect(model.isVisible()).toBe(true)
  })

  it("isActiveTerminal() visible and active", () => {
    model.activeIndex = 0
    spyOn(model, "isVisible").and.returnValue(true)
    expect(model.isActiveTerminal()).toBe(true)
  })

  it("isActiveTerminal() visible and not active", () => {
    model.activeIndex = 1
    spyOn(model, "isVisible").and.returnValue(true)
    expect(model.isActiveTerminal()).toBe(false)
  })

  it("isActiveTerminal() invisible and active", () => {
    model.activeIndex = 0
    spyOn(model, "isVisible").and.returnValue(false)
    expect(model.isActiveTerminal()).toBe(false)
  })

  it("isActiveTerminal() allowHiddenToStayActive", () => {
    atom.config.set("terminal.allowHiddenToStayActive", true)
    model.activeIndex = 0
    spyOn(model, "isVisible").and.returnValue(false)
    expect(model.isActiveTerminal()).toBe(true)
  })

  it("isTerminalModel() item is TerminalModel", () => {
    expect(TerminalModel.isTerminalModel(model)).toBe(true)
  })

  it("isTerminalModel() item is not TerminalModel", () => {
    const item = document.createElement("div")
    expect(TerminalModel.isTerminalModel(item)).toBe(false)
  })

  describe("recalculateActive()", () => {
    const createTerminals = (num = 1): TerminalModel[] => {
      const terminals = []
      for (let i = 0; i < num; i++) {
        terminals.push({
          activeIndex: i,
          isVisible() {},
          emitter: {
            emit() {},
          },
          title: `title ${i}`,
        })
      }
      return terminals as TerminalModel[]
    }

    it("active first", () => {
      const terminals = createTerminals(2)
      TerminalModel.recalculateActive(new Set(terminals), terminals[1])
      expect(terminals[0].activeIndex).toBe(1)
      expect(terminals[1].activeIndex).toBe(0)
    })

    it("visible before hidden", () => {
      const terminals = createTerminals(2)
      spyOn(terminals[1], "isVisible").and.returnValue(true)
      TerminalModel.recalculateActive(new Set(terminals))
      expect(terminals[0].activeIndex).toBe(1)
      expect(terminals[1].activeIndex).toBe(0)
    })

    it("allowHiddenToStayActive", () => {
      atom.config.set("terminal.allowHiddenToStayActive", true)
      const terminals = createTerminals(2)
      spyOn(terminals[1], "isVisible").and.returnValue(true)
      TerminalModel.recalculateActive(new Set(terminals))
      expect(terminals[0].activeIndex).toBe(0)
      expect(terminals[1].activeIndex).toBe(1)
    })

    it("lower active index first", () => {
      const terminals = createTerminals(2)
      terminals[0].activeIndex = 1
      terminals[1].activeIndex = 0
      TerminalModel.recalculateActive(new Set(terminals))
      expect(terminals[0].activeIndex).toBe(1)
      expect(terminals[1].activeIndex).toBe(0)
    })

    it("emit did-change-title", () => {
      const terminals = createTerminals(2)
      spyOn(terminals[0].emitter, "emit")
      spyOn(terminals[1].emitter, "emit")
      TerminalModel.recalculateActive(new Set(terminals))
      // @ts-ignore
      expect(terminals[0].emitter.emit).toHaveBeenCalledWith("did-change-title", "title 0")
      // @ts-ignore
      expect(terminals[1].emitter.emit).toHaveBeenCalledWith("did-change-title", "title 1")
    })
  })
})
