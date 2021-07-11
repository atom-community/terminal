import { CompositeDisposable, Workspace, Dock, Pane, WorkspaceOpenOptions } from "atom"

import { createTerminalElement } from "./element"
import { TerminalModel } from "./model"
import { addToolbarButton, removeToolbarButton } from "./button"
export { consumeToolBar } from "./button"

import { v4 as uuidv4 } from "uuid"

interface OpenOptions extends WorkspaceOpenOptions {
  target?: EventTarget | null
  pane?: Pane
}

function debounce(callback: (...args: unknown[]) => void, wait: number = 300) {
  let timeoutId: NodeJS.Timeout
  return (...args: unknown[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback(...args)
    }, wait)
  }
}

const TERMINAL_BASE_URI = "atomic-terminal://"

class Terminal {
  // TODO: maybe private?
  public disposables: CompositeDisposable
  public terminalsSet: Set<TerminalModel>

  constructor() {
    // Disposables for this plugin.
    this.disposables = new CompositeDisposable()

    // Set holding all terminals available at any moment.
    this.terminalsSet = new Set()

    const debounceUpdateTheme = debounce(() => {
      this.updateTheme()
    })

    this.disposables.add(
      // Register view provider for terminal emulator item.
      atom.views.addViewProvider(TerminalModel, (terminalModel) => {
        const terminalElement = createTerminalElement()
        terminalElement.initialize(terminalModel)
        return terminalElement
      }),

      // Add opener for terminal emulator item.
      atom.workspace.addOpener((uri) => {
        if (uri.startsWith(TERMINAL_BASE_URI)) {
          const item = new TerminalModel({
            uri,
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

      atom.config.onDidChange("atomic-terminal.toolbarButton", ({ newValue }: {newValue: boolean}) => {
        if (newValue) {
          addToolbarButton()
        } else {
          removeToolbarButton()
        }
      }),

      // Theme changes
      atom.config.onDidChange("atomic-terminal.colors", () => {
        // not debounced to update immediately
        this.updateTheme()
      }),
      atom.themes.onDidChangeActiveThemes(debounceUpdateTheme),
      atom.styles.onDidUpdateStyleElement(debounceUpdateTheme),
      atom.styles.onDidAddStyleElement(debounceUpdateTheme),
      atom.styles.onDidRemoveStyleElement(debounceUpdateTheme),

      // Add commands.
      // @ts-ignore
      atom.commands.add("atom-workspace", {
        "atomic-terminal:open": () => this.open(this.generateNewUri(), this.addDefaultPosition()),
        "atomic-terminal:open-center": () => this.openInCenterOrDock(atom.workspace),
        "atomic-terminal:open-up": () => this.open(this.generateNewUri(), { split: "up" }),
        "atomic-terminal:open-down": () => this.open(this.generateNewUri(), { split: "down" }),
        "atomic-terminal:open-left": () => this.open(this.generateNewUri(), { split: "left" }),
        "atomic-terminal:open-right": () => this.open(this.generateNewUri(), { split: "right" }),
        "atomic-terminal:open-bottom-dock": () => this.openInCenterOrDock(atom.workspace.getBottomDock()),
        "atomic-terminal:open-left-dock": () => this.openInCenterOrDock(atom.workspace.getLeftDock()),
        "atomic-terminal:open-right-dock": () => this.openInCenterOrDock(atom.workspace.getRightDock()),
        "atomic-terminal:close-all": () => this.exitAllTerminals(),
        "atomic-terminal:focus": () => this.focus(),
      }),
      // @ts-ignore
      atom.commands.add("atom-text-editor, .tree-view, .tab-bar", {
        "atomic-terminal:open-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.open(this.generateNewUri(), this.addDefaultPosition({ target })),
        },
        "atomic-terminal:open-center-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.openInCenterOrDock(atom.workspace, { target }),
        },
        "atomic-terminal:open-split-up-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.open(this.generateNewUri(), { split: "up", target }),
        },
        "atomic-terminal:open-split-down-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.open(this.generateNewUri(), { split: "down", target }),
        },
        "atomic-terminal:open-split-left-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.open(this.generateNewUri(), { split: "left", target }),
        },
        "atomic-terminal:open-split-right-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.open(this.generateNewUri(), { split: "right", target }),
        },
        "atomic-terminal:open-split-bottom-dock-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.openInCenterOrDock(atom.workspace.getBottomDock(), { target }),
        },
        "atomic-terminal:open-split-left-dock-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.openInCenterOrDock(atom.workspace.getLeftDock(), { target }),
        },
        "atomic-terminal:open-split-right-dock-context-menu": {
          hiddenInCommandPalette: true,
          didDispatch: ({ target }) => this.openInCenterOrDock(atom.workspace.getRightDock(), { target }),
        },
      }),
      atom.commands.add("atomic-terminal", {
        "atomic-terminal:close": () => this.close(),
        "atomic-terminal:restart": () => this.restart(),
        "atomic-terminal:copy": () => this.copy(),
        "atomic-terminal:paste": () => this.paste(),
        "atomic-terminal:unfocus": () => this.unfocus(),
        "atomic-terminal:clear": () => this.clear(),
      })
    )
  }

  // eslint-disable-next-line
  activate() {}

  destroy() {
    this.exitAllTerminals()
    removeToolbarButton()
    this.disposables.dispose()
  }

  deserializeTerminalModel(serializedModel: TerminalModel) {
    if (atom.config.get("atomic-terminal.allowRelaunchingTerminalsOnStartup")) {
      return new TerminalModel({
        uri: serializedModel.uri,
        terminalsSet: this.terminalsSet,
      })
    }
    return
  }

  openInCenterOrDock(centerOrDock: Workspace | Dock, options: OpenOptions = {}) {
    const pane = centerOrDock.getActivePane()
    if (pane) {
      options.pane = pane
    }
    return this.open(this.generateNewUri(), options)
  }

  exitAllTerminals() {
    for (const terminal of this.terminalsSet) {
      terminal.exit()
    }
  }

  updateTheme() {
    for (const terminal of this.terminalsSet) {
      terminal.updateTheme()
    }
  }

  getActiveTerminal() {
    const terminals = [...this.terminalsSet]
    return terminals.find((t) => t.isActiveTerminal())
  }

  async open(uri: string, options: OpenOptions = {}): Promise<TerminalModel> {
    // TODO: should we check uri for TERMINAL_BASE_URI?
    // if (!uri.startsWith(TERMINAL_BASE_URI)) {
    //   return null
    // }

    const url = new URL(uri)
    if (options.target) {
      const target = this.getPath(options.target)
      if (target) {
        url.searchParams.set("cwd", target)
      }
    }
    return <Promise<TerminalModel>>atom.workspace.open(url.href, options)
  }

  generateNewUri() {
    return `${TERMINAL_BASE_URI + uuidv4()}/`
  }

  /**
   * Service function which is a wrapper around 'atom.workspace.open()'.
   *
   * @async
   * @function
   * @param {Object} options Options to pass to call to 'atom.workspace.open()'.
   * @returns {TerminalModel} Instance of TerminalModel.
   */
  async openTerminal(options: OpenOptions = {}): Promise<TerminalModel> {
    options = this.addDefaultPosition(options)
    return this.open(this.generateNewUri(), options)
  }

  /**
   * Service function which opens a terminal and runs the commands.
   *
   * @async
   * @function
   * @param {string[]} commands Commands to run in the terminal.
   * @returns {TerminalModel} Instance of TerminalModel.
   */
  async runCommands(commands: string[]): Promise<TerminalModel> {
    let terminal
    if (atom.config.get("atomic-terminal.runInActive")) {
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

  addDefaultPosition(options: OpenOptions = {}): OpenOptions {
    const position = atom.config.get("atomic-terminal.defaultOpenPosition")
    switch (position) {
      case "Center": {
        const pane = atom.workspace.getActivePane()
        if (pane && !("pane" in options)) {
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
          options.pane = pane
        }
        break
      }
      case "Left Dock": {
        const pane = atom.workspace.getLeftDock().getActivePane()
        if (pane && !("pane" in options)) {
          options.pane = pane
        }
        break
      }
      case "Right Dock": {
        const pane = atom.workspace.getRightDock().getActivePane()
        if (pane && !("pane" in options)) {
          options.pane = pane
        }
        break
      }
    }
    return options
  }

  getPath(target: EventTarget | null): string | null | undefined {
    if (!target || !(target instanceof HTMLElement)) {
      const paths = atom.project.getPaths()
      if (paths && paths.length > 0) {
        return paths[0]
      }
      return null
    }

    const treeView = target.closest(".tree-view")
    if (treeView) {
      // called from treeview
      const selected = treeView.querySelector(".selected > .list-item > .name, .selected > .name") as HTMLElement
      if (selected) {
        return selected.dataset.path
      }
      return null
    }

    const tab = target.closest(".tab-bar > .tab")
    if (tab) {
      // called from tab
      const title = tab.querySelector(".title") as HTMLElement
      if (title && title.dataset.path) {
        return title.dataset.path
      }
      return null
    }

    const textEditor = target.closest("atom-text-editor")
    if (textEditor && typeof textEditor.getModel === "function") {
      // called from atom-text-editor
      const model = textEditor.getModel()
      if (model && typeof model.getPath === "function") {
        const modelPath = model.getPath()
        if (modelPath) {
          return modelPath
        }
      }
      return null
    }

    return null
  }

  /** Function providing service functions offered by 'terminal' service. */
  provideTerminalService() {
    // TODO: provide other service functions
    return providePlatformIOIDEService()
  }

  /** Function providing service functions offered by 'platformioIDETerminal' service. */
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
      terminal.focusOnTerminal(true)
    } else {
      const options = this.addDefaultPosition()
      await this.open(this.generateNewUri(), options)
    }
  }

  unfocus() {
    atom.views.getView(atom.workspace).focus()
  }

  clear() {
    const terminal = this.getActiveTerminal()
    if (terminal) {
      terminal.clear()
    }
  }
}

let terminalInstance: Terminal | null = null

export { config } from "./config"

export function getInstance(): Terminal {
  if (!terminalInstance) {
    terminalInstance = new Terminal()
  }
  return terminalInstance
}

export function activate(): void {
  return getInstance().activate()
}

export function deactivate(): void {
  if (terminalInstance) {
    terminalInstance.destroy()
    terminalInstance = null
  }
}

export function deserializeTerminalModel(serializedModel: TerminalModel) {
  return getInstance().deserializeTerminalModel(serializedModel)
}

export function provideTerminalService() {
  return getInstance().provideTerminalService()
}

export function providePlatformIOIDEService() {
  return getInstance().providePlatformIOIDEService()
}
