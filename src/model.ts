import { Emitter, Pane, Dock } from "atom"

import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"

import { AtomTerminal } from "./element"

import { URL } from "whatwg-url"

const DEFAULT_TITLE = "Terminal"

/**
 * The main terminal model, or rather item, displayed in the Atom workspace.
 *
 * @class
 */
export class TerminalModel {
  // TODO: maybe private?
  public uri: string
  public sessionId: string
  public title: string
  public modified: boolean
  public isInitialized: boolean
  public initializedPromise: Promise<void>
  public fontSize: number
  public terminalsSet: Set<TerminalModel>
  public activeIndex: number
  public element?: AtomTerminal
  public pane?: Pane
  public dock?: Dock
  public emitter: Emitter
  public cwd?: string

  constructor({ uri, terminalsSet }: { uri: string; terminalsSet: Set<TerminalModel> }) {
    this.uri = uri
    const url = new URL(this.uri)
    this.sessionId = url.host
    this.terminalsSet = terminalsSet
    this.activeIndex = this.terminalsSet.size
    this.title = DEFAULT_TITLE
    this.fontSize = atom.config.get("terminal.fontSize")
    this.modified = false
    this.emitter = new Emitter()
    this.terminalsSet.add(this)

    // Determine appropriate initial working directory based on previous
    // active item. Since this involves async operations on the file
    // system, a Promise will be used to indicate when initialization is
    // done.
    this.isInitialized = false
    this.initializedPromise = this.initialize().then(() => {
      this.isInitialized = true
    })
  }

  async initialize() {
    this.cwd = await this.getInitialCwd()
  }

  async getInitialCwd() {
    const previousActiveItem = atom.workspace.getActivePaneItem()
    // @ts-ignore
    let cwd = previousActiveItem?.getPath?.()
    const dir = atom.project.relativizePath(cwd)[0]
    if (dir) {
      // Use project paths whenever they are available by default.
      return dir
    }

    try {
      // Otherwise, if the path exists on the local file system, use the
      // path or parent directory as appropriate.
      const stats = await fs.stat(cwd)
      if (stats.isDirectory()) {
        return cwd
      }

      cwd = path.dirname(cwd)
      const dirStats = await fs.stat(cwd)
      if (dirStats.isDirectory()) {
        return cwd
      }
    } catch (ex) {}

    cwd = atom.project.getPaths()[0]
    // no project paths
    if (cwd) {
      return cwd
    }

    return
  }

  serialize() {
    return {
      deserializer: "TerminalModel",
      version: "1.0.0",
      uri: this.uri,
    }
  }

  destroy() {
    if (this.element) {
      this.element.destroy()
    }
    this.terminalsSet.delete(this)
  }

  getTitle() {
    return (this.isActiveTerminal() ? "* " : "") + this.title
  }

  getElement() {
    return this.element
  }

  getURI() {
    return this.uri
  }

  getLongTitle() {
    if (this.title === DEFAULT_TITLE) {
      return DEFAULT_TITLE
    }
    return DEFAULT_TITLE + " (" + this.title + ")"
  }

  onDidChangeTitle(callback: (value?: any) => void) {
    return this.emitter.on("did-change-title", callback)
  }

  getIconName() {
    return "terminal"
  }

  getPath() {
    return this.cwd
  }

  isModified() {
    return this.modified
  }

  onDidChangeModified(callback: (value?: any) => void) {
    return this.emitter.on("did-change-modified", callback)
  }

  handleNewDataArrival() {
    if (!this.pane) {
      this.pane = atom.workspace.paneForItem(this)
    }
    const oldIsModified = this.modified
    let item
    if (this.pane) {
      item = this.pane.getActiveItem()
    }
    if (item === this) {
      this.modified = false
    } else {
      this.modified = true
    }
    if (oldIsModified !== this.modified) {
      this.emitter.emit("did-change-modified", this.modified)
    }
  }

  getSessionId() {
    return this.sessionId
  }

  refitTerminal() {
    // Only refit if there's a DOM element attached to the model.
    if (this.element) {
      this.element.refitTerminal()
    }
  }

  focusOnTerminal() {
    if (this.element) {
      this.element.focusOnTerminal()
      const oldIsModified = this.modified
      this.modified = false
      if (oldIsModified !== this.modified) {
        this.emitter.emit("did-change-modified", this.modified)
      }
    }
  }

  exit() {
    if (this.pane) {
      this.pane.destroyItem(this, true)
    }
  }

  restartPtyProcess() {
    if (this.element) {
      this.element.restartPtyProcess()
    }
  }

  copyFromTerminal() {
    if (this.element && this.element.terminal) {
      return this.element.terminal.getSelection()
    }
    return
  }

  runCommand(cmd: string) {
    this.pasteToTerminal(cmd + os.EOL.charAt(0))
  }

  pasteToTerminal(text: string) {
    if (this.element && this.element.ptyProcess) {
      this.element.ptyProcess.write(text)
    }
  }

  setActive() {
    TerminalModel.recalculateActive(this.terminalsSet, this)
  }

  isVisible() {
    return this.pane && this.pane.getActiveItem() === this && (!this.dock || this.dock.isVisible())
  }

  isActiveTerminal() {
    return this.activeIndex === 0 && (atom.config.get("terminal.allowHiddenToStayActive") || this.isVisible())
  }

  setNewPane(pane: Pane) {
    this.pane = pane
    // @ts-ignore
    const location = this.pane.getContainer().getLocation()
    switch (location) {
      case "left":
        this.dock = atom.workspace.getLeftDock()
        break
      case "right":
        this.dock = atom.workspace.getRightDock()
        break
      case "bottom":
        this.dock = atom.workspace.getBottomDock()
        break
      default:
        this.dock = undefined
    }
  }

  static recalculateActive(terminalsSet: Set<TerminalModel>, active?: TerminalModel) {
    const allowHidden = atom.config.get("terminal.allowHiddenToStayActive")
    const terminals = [...terminalsSet]
    terminals.sort((a, b) => {
      // active before other
      if (active && a === active) {
        return -1
      }
      if (active && b === active) {
        return 1
      }
      if (!allowHidden) {
        // visible before hidden
        if (a.isVisible() && !b.isVisible()) {
          return -1
        }
        if (!a.isVisible() && b.isVisible()) {
          return 1
        }
      }
      // lower activeIndex before higher activeIndex
      return a.activeIndex - b.activeIndex
    })
    terminals.forEach((t, i) => {
      t.activeIndex = i
      t.emitter.emit("did-change-title", t.title)
    })
  }

  static isTerminalModel(item: unknown) {
    return item instanceof TerminalModel
  }
}
