import { CompositeDisposable, Workspace, Dock, WorkspaceOpenOptions } from "atom"

import { TerminalElement } from "./element"
import { TerminalModel } from "./model"
import { setShellStartCommand } from "./config"

import { v4 as uuidv4 } from "uuid"

const TERMINAL_BASE_URI = "terminal://"

class Terminal {
  // TODO: maybe private?
  public disposables: CompositeDisposable
  public terminalsSet: Set<TerminalModel>

  constructor() {
    // Disposables for this plugin.
    this.disposables = new CompositeDisposable()

    // Set holding all terminals available at any moment.
    this.terminalsSet = new Set()

    // set start command asyncronously
    // TODO does any part of the code rely on this? If so we should await the promise before there
    setShellStartCommand(this.disposables).catch(() => {
      // run again with autoShell being false
      atom.config.set("x-terminal.spawnPtySettings.autoShell", false)
      setShellStartCommand(this.disposables).catch((e) => {
        throw e
      })
    })

    this.disposables.add(
      // Register view provider for terminal emulator item.
      atom.views.addViewProvider(TerminalModel, (terminalModel) => {
        const terminalElement = new TerminalElement()
        terminalElement.initialize(terminalModel)
        return terminalElement
      }),

      // Add opener for terminal emulator item.
      atom.workspace.addOpener((uri) => {
        if (uri.startsWith(TERMINAL_BASE_URI)) {
          const item = new TerminalModel({
            uri: uri,
            terminalsSet: this.terminalsSet,
          })
          return item
        }
        return
      }),

      // Set callback to run on current and future panes.
      atom.workspace.observePanes((pane) => {
        // In callback, set another callback to run on current and future items.
        this.disposables.add(
          pane.observeItems((item) => {
            // In callback, set current pane for terminal items.
            if (TerminalModel.isTerminalModel(item)) {
              ;(<TerminalModel>item).setNewPane(pane)
            }
            TerminalModel.recalculateActive(this.terminalsSet)
          })
        )
        TerminalModel.recalculateActive(this.terminalsSet)
      }),

      // Add callbacks to run for current and future active items on active panes.
      atom.workspace.observeActivePaneItem((item) => {
        // In callback, focus specifically on terminal when item is terminal item.
        if (TerminalModel.isTerminalModel(item)) {
          ;(<TerminalModel>item).focusOnTerminal()
        }
        TerminalModel.recalculateActive(this.terminalsSet)
      }),

      atom.workspace.getRightDock().observeVisible((visible) => {
        if (visible) {
          const item = atom.workspace.getRightDock().getActivePaneItem()
          if (TerminalModel.isTerminalModel(item)) {
            ;(<TerminalModel>item).focusOnTerminal()
          }
        }
        TerminalModel.recalculateActive(this.terminalsSet)
      }),

      atom.workspace.getLeftDock().observeVisible((visible) => {
        if (visible) {
          const item = atom.workspace.getLeftDock().getActivePaneItem()
          if (TerminalModel.isTerminalModel(item)) {
            ;(<TerminalModel>item).focusOnTerminal()
          }
        }
        TerminalModel.recalculateActive(this.terminalsSet)
      }),

      atom.workspace.getBottomDock().observeVisible((visible) => {
        if (visible) {
          const item = atom.workspace.getBottomDock().getActivePaneItem()
          if (TerminalModel.isTerminalModel(item)) {
            ;(<TerminalModel>item).focusOnTerminal()
          }
        }
        TerminalModel.recalculateActive(this.terminalsSet)
      }),

      // Add commands.
      // @ts-ignore
      atom.commands.add("atom-workspace", {
        "terminal:open": () => this.open(this.generateNewUri(), this.addDefaultPosition()),
        "terminal:open-center": () => this.openInCenterOrDock(atom.workspace),
        "terminal:open-up": () => this.open(this.generateNewUri(), { split: "up" }),
        "terminal:open-down": () => this.open(this.generateNewUri(), { split: "down" }),
        "terminal:open-left": () => this.open(this.generateNewUri(), { split: "left" }),
        "terminal:open-right": () => this.open(this.generateNewUri(), { split: "right" }),
        "terminal:open-bottom-dock": () => this.openInCenterOrDock(atom.workspace.getBottomDock()),
        "terminal:open-left-dock": () => this.openInCenterOrDock(atom.workspace.getLeftDock()),
        "terminal:open-right-dock": () => this.openInCenterOrDock(atom.workspace.getRightDock()),
        "terminal:close-all": () => this.exitAllTerminals(),
        "terminal:focus": () => this.focus(),
      }),
      atom.commands.add("atom-terminal", {
        "terminal:close": () => this.close(),
        "terminal:restart": () => this.restart(),
        "terminal:copy": () => this.copy(),
        "terminal:paste": () => this.paste(),
        "terminal:unfocus": () => this.unfocus(),
      })
    )
  }

  // eslint-disable-next-line
  activate() {}

  destroy() {
    this.exitAllTerminals()
    this.disposables.dispose()
  }

  //@ts-ignore
  deserializeTerminalModel(serializedModel) {
    if (atom.config.get("terminal.allowRelaunchingTerminalsOnStartup")) {
      return new TerminalModel({
        uri: serializedModel.uri,
        terminalsSet: this.terminalsSet,
      })
    }
    return
  }

  openInCenterOrDock(centerOrDock: Workspace | Dock, options: WorkspaceOpenOptions = {}) {
    const pane = centerOrDock.getActivePane()
    if (pane) {
      // @ts-ignore
      options.pane = pane
    }
    return this.open(this.generateNewUri(), options)
  }

  exitAllTerminals() {
    for (const terminal of this.terminalsSet) {
      terminal.exit()
    }
  }

  getActiveTerminal() {
    const terminals = [...this.terminalsSet]
    return terminals.find((t) => t.isActiveTerminal())
  }

  async open(uri: string, options = {}): Promise<TerminalModel> {
    // TODO: should we check uri for TERMINAL_BASE_URI?
    return <Promise<TerminalModel>>atom.workspace.open(uri, options)
  }

  generateNewUri() {
    return TERMINAL_BASE_URI + uuidv4() + "/"
  }

  /**
   * Service function which is a wrapper around 'atom.workspace.open()'.
   *
   * @async
   * @function
   * @param {Object} options Options to pass to call to 'atom.workspace.open()'.
   * @return {TerminalModel} Instance of TerminalModel.
   */
  async openTerminal(options: WorkspaceOpenOptions = {}): Promise<TerminalModel> {
    options = this.addDefaultPosition(options)
    return this.open(this.generateNewUri(), options)
  }

  /**
   * Service function which opens a terminal and runs the commands.
   *
   * @async
   * @function
   * @param {string[]} commands Commands to run in the terminal.
   * @return {TerminalModel} Instance of TerminalModel.
   */
  async runCommands(commands: string[]): Promise<TerminalModel> {
    let terminal
    if (atom.config.get("terminal.runInActive")) {
      terminal = this.getActiveTerminal()
    }

    if (!terminal) {
      const options = this.addDefaultPosition()
      terminal = await this.open(this.generateNewUri(), options)
    }

    if (terminal.element) {
      await terminal.element.initializedPromise
      for (const command of commands) {
        terminal.runCommand(command)
      }
    }

    return terminal
  }

  addDefaultPosition(options: WorkspaceOpenOptions = {}): WorkspaceOpenOptions {
    const position = atom.config.get("terminal.defaultOpenPosition")
    switch (position) {
      case "Center": {
        const pane = atom.workspace.getActivePane()
        if (pane && !("pane" in options)) {
          // @ts-ignore
          options.pane = pane
        }
        break
      }
      case "Split Up":
        if (!("split" in options)) {
          options.split = "up"
        }
        break
      case "Split Down":
        if (!("split" in options)) {
          options.split = "down"
        }
        break
      case "Split Left":
        if (!("split" in options)) {
          options.split = "left"
        }
        break
      case "Split Right":
        if (!("split" in options)) {
          options.split = "right"
        }
        break
      case "Bottom Dock": {
        const pane = atom.workspace.getBottomDock().getActivePane()
        if (pane && !("pane" in options)) {
          // @ts-ignore
          options.pane = pane
        }
        break
      }
      case "Left Dock": {
        const pane = atom.workspace.getLeftDock().getActivePane()
        if (pane && !("pane" in options)) {
          // @ts-ignore
          options.pane = pane
        }
        break
      }
      case "Right Dock": {
        const pane = atom.workspace.getRightDock().getActivePane()
        if (pane && !("pane" in options)) {
          // @ts-ignore
          options.pane = pane
        }
        break
      }
    }
    return options
  }

  /**
   * Function providing service functions offered by 'terminal' service.
   *
   * @function
   * @returns {Object} Object holding service functions.
   */
  provideTerminalService() {
    // TODO: provide other service functions
    return providePlatformIOIDEService()
  }

  /**
   * Function providing service functions offered by 'platformioIDETerminal' service.
   *
   * @function
   * @returns {Object} Object holding service functions.
   */
  providePlatformIOIDEService() {
    return {
      updateProcessEnv(vars: Record<string, string>): void {
        for (const name in vars) {
          process.env[name] = vars[name]
        }
      },
      run: (commands: string[]): Promise<TerminalModel> => {
        return this.runCommands(commands)
      },
      getTerminalViews: (): TerminalModel[] => {
        return [...this.terminalsSet]
      },
      open: (): Promise<TerminalModel> => {
        return this.openTerminal()
      },
    }
  }

  close() {
    const terminal = this.getActiveTerminal()
    if (terminal) {
      terminal.exit()
    }
  }

  restart() {
    const terminal = this.getActiveTerminal()
    if (terminal) {
      terminal.restartPtyProcess()
    }
  }

  copy() {
    const terminal = this.getActiveTerminal()
    if (terminal) {
      const text = terminal.copyFromTerminal()
      if (text) {
        atom.clipboard.write(text)
      }
    }
  }

  paste() {
    const terminal = this.getActiveTerminal()
    if (terminal) {
      terminal.pasteToTerminal(atom.clipboard.read())
    }
  }

  async focus() {
    const terminal = [...this.terminalsSet].find((t) => t.activeIndex === 0)
    if (terminal) {
      terminal.focusOnTerminal()
    } else {
      const options = this.addDefaultPosition()
      await this.open(this.generateNewUri(), options)
    }
  }

  unfocus() {
    atom.views.getView(atom.workspace).focus()
  }
}

let terminal: Terminal | null = null

export { config } from "./config"

export function getInstance(): Terminal {
  if (!terminal) {
    terminal = new Terminal()
  }
  return terminal
}

export function activate(): void {
  return getInstance().activate()
}

export function deactivate(): void {
  if (terminal) {
    terminal.destroy()
    terminal = null
  }
}

// @ts-ignore
export function deserializeTerminalModel(serializedModel) {
  return getInstance().deserializeTerminalModel(serializedModel)
}

export function provideTerminalService() {
  return getInstance().provideTerminalService()
}

export function providePlatformIOIDEService() {
  return getInstance().providePlatformIOIDEService()
}
