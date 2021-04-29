const { CompositeDisposable } = require("atom")
const { $, View } = require("atom-space-pen-views-plus")

const StatusIcon = require("./status-icon")

const path = require("path")
const _ = require("underscore")

class StatusBar extends View {
  static content() {
    this.div({ class: "terminal status-bar", tabindex: -1 }, () => {
      this.i({ class: "icon icon-plus", click: "newTerminalView", outlet: "plusBtn" })
      this.ul({ class: "list-inline status-container", tabindex: "-1", outlet: "statusContainer", is: "space-pen-ul" })
      this.i({ class: "icon icon-x", click: "closeAll", outlet: "closeBtn" })
    })
  }

  initialize(statusBarProvider) {
    this.statusBarProvider = statusBarProvider
    this.subscriptions = new CompositeDisposable()

    this.onDropTabBar = this.onDropTabBar.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDrop = this.onDrop.bind(this)

    // this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
    //   if (!item) { return }
    //
    //   if (item.constructor.name === 'TerminalView') {
    //     setTimeout(item.focus, 100)
    //   } else if (item.constructor.name === 'TextEditor') {
    //     const mapping = atom.config.get('terminal.core.mapTerminalsTo')
    //     if (mapping === 'None') { return }
    //     if (!item.getPath()) { return }
    //
    //     let nextTerminal
    //     switch (mapping) {
    //       case 'File':
    //         nextTerminal = this.getTerminalById(item.getPath(), view => view.getId().filePath)
    //         break
    //       case 'Folder':
    //         nextTerminal = this.getTerminalById(path.dirname(item.getPath()), view => view.getId().folderPath)
    //         break
    //     }
    //
    //     const prevTerminal = this.getActiveTerminalView()
    //     if (prevTerminal !== nextTerminal) {
    //       if (!nextTerminal) {
    //         if (atom.config.get('terminal.core.mapTerminalsToAutoOpen')) {
    //           nextTerminal = this.createTerminalView()
    //         }
    //       } else {
    //         this.setActiveTerminalView(nextTerminal)
    //         if (prevTerminal && prevTerminal.panel.isVisible()) {
    //           nextTerminal.toggle()
    //         }
    //       }
    //     }
    //   }
    // }))

    this.registerContextMenu()

    this.subscriptions.add(atom.tooltips.add(this.plusBtn, { title: "New Terminal" }))
    this.subscriptions.add(atom.tooltips.add(this.closeBtn, { title: "Close All" }))

    this.statusContainer.on("dblclick", (event) => {
      if (event.target === event.delegateTarget) {
        this.newTerminalView()
      }
    })

    this.statusContainer.on("dragstart", ".terminal-status-icon", this.onDragStart)
    this.statusContainer.on("dragend", ".terminal-status-icon", this.onDragEnd)
    this.statusContainer.on("dragleave", this.onDragLeave)
    this.statusContainer.on("dragover", this.onDragOver)
    this.statusContainer.on("drop", this.onDrop)

    const handleBlur = () => {
      const terminal = TerminalView.getFocusedTerminal()
      if (terminal) {
        this.returnFocus = this.terminalViewForTerminal(terminal)
        terminal.blur()
      }
    }

    const handleFocus = () => {
      if (this.returnFocus) {
        setTimeout(() => {
          if (this.returnFocus) {
            this.returnFocus.focus(true)
          }
          this.returnFocus = null
        }, 100)
      }
    }

    window.addEventListener("blur", handleBlur)
    this.subscriptions.add({
      dispose() {
        window.removeEventListener("blur", handleBlur)
      },
    })

    window.addEventListener("focus", handleFocus)
    this.subscriptions.add({
      dispose() {
        window.removeEventListener("focus", handleFocus)
      },
    })

    this.attach()
  }

  registerContextMenu() {
    this.subscriptions.add(
      atom.commands.add(".terminal.status-bar", {
        "terminal:status-red": this.setStatusColor,
        "terminal:status-orange": this.setStatusColor,
        "terminal:status-yellow": this.setStatusColor,
        "terminal:status-green": this.setStatusColor,
        "terminal:status-blue": this.setStatusColor,
        "terminal:status-purple": this.setStatusColor,
        "terminal:status-pink": this.setStatusColor,
        "terminal:status-cyan": this.setStatusColor,
        "terminal:status-magenta": this.setStatusColor,
        "terminal:status-default": this.clearStatusColor,
        "terminal:context-close"(event) {
          $(event.target).closest(".terminal-status-icon")[0].terminalView.destroy()
        },
        "terminal:context-hide"(event) {
          const statusIcon = $(event.target).closest(".terminal-status-icon")[0]
          if (statusIcon.isActive()) {
            statusIcon.terminalView.hide()
          }
        },
        "terminal:context-rename"(event) {
          $(event.target).closest(".terminal-status-icon")[0].rename()
        },
      })
    )
  }

  registerPaneSubscription() {
    this.subscriptions.add(
      (this.paneSubscription = atom.workspace.observePanes((pane) => {
        const paneElement = $(atom.views.getView(pane))
        const tabBar = paneElement.find("ul")

        tabBar.on("drop", (event) => this.onDropTabBar(event, pane))
        tabBar.on("dragstart", (event) => {
          if ((event.target.item ? event.target.item.constructor.name : undefined) !== "TerminalView") {
            return
          }
          event.originalEvent.dataTransfer.setData("terminal-tab", "true")
        })
        pane.onDidDestroy(() => tabBar.off("drop", this.onDropTabBar))
      }))
    )
  }

  createTerminalView(autoRun) {
    const shell = atom.config.get("terminal.core.shell")
    const shellArguments = atom.config.get("terminal.core.shellArguments")
    const args = shellArguments.split(/\s+/g).filter((arg) => arg)
    const shellEnv = atom.config.get("terminal.core.shellEnv")
    let env = {}
    shellEnv.split(" ").forEach((element) => {
      const configVar = element.split("=")
      const envVar = {}
      envVar[configVar[0]] = configVar[1]
      env = _.extend(env, envVar)
    })
    return this.createEmptyTerminalView(autoRun, shell, args, env)
  }

  createEmptyTerminalView(autoRun = [], shell = null, args = [], env = {}) {
    if (!this.paneSubscription) {
      this.registerPaneSubscription()
    }

    let projectFolder = atom.project.getPaths()[0]
    const editor = atom.workspace.getActiveTextEditor()
    const editorPath = editor && editor.getPath()

    let editorFolder
    if (editorPath) {
      editorFolder = path.dirname(editorPath)
      for (const directory of atom.project.getPaths()) {
        if (editorPath.indexOf(directory) >= 0) {
          projectFolder = directory
        }
      }
    }

    if (!projectFolder || projectFolder.includes("atom://")) {
      projectFolder = undefined
    }

    const home = process.platform === "win32" ? process.env.HOMEPATH : process.env.HOME

    let pwd
    switch (atom.config.get("terminal.core.workingDirectory")) {
      case "Project":
        pwd = projectFolder || editorFolder || home
        break
      case "Active File":
        pwd = editorFolder || projectFolder || home
        break
      default:
        pwd = home
    }

    let id = editorPath || projectFolder || home
    id = { filePath: id, folderPath: path.dirname(id) }

    const statusIcon = new StatusIcon()
    const terminalView = new TerminalView(id, pwd, statusIcon, this, shell, args, env, autoRun)
    statusIcon.initialize(terminalView)

    terminalView.attach()

    this.terminalViews.push(terminalView)
    this.statusContainer.append(statusIcon)
    return terminalView
  }

  activeNextTerminalView() {
    const index = this.indexOf(this.activeTerminal)
    if (index < 0) {
      return false
    }
    return this.activeTerminalView(index + 1)
  }

  activePrevTerminalView() {
    const index = this.indexOf(this.activeTerminal)
    if (index < 0) {
      return false
    }
    return this.activeTerminalView(index - 1)
  }

  indexOf(view) {
    return this.terminalViews.indexOf(view)
  }

  activeTerminalView(index) {
    if (this.terminalViews.length < 2) {
      return false
    }

    if (index >= this.terminalViews.length) {
      index = 0
    }
    if (index < 0) {
      index = this.terminalViews.length - 1
    }

    this.activeTerminal = this.terminalViews[index]
    return true
  }

  getActiveTerminalView() {
    return this.activeTerminal
  }

  focusTerminal() {
    if (!this.activeTerminal) {
      return
    }

    if (TerminalView.getFocusedTerminal()) {
      this.activeTerminal.blur()
    } else {
      this.activeTerminal.focusTerminal()
    }
  }

  getTerminalById(target, selector) {
    if (!selector) {
      selector = (terminal) => terminal.id
    }

    for (const terminal of this.terminalViews) {
      if (terminal) {
        if (selector(terminal) === target) {
          return terminal
        }
      }
    }

    return null
  }

  terminalViewForTerminal(terminal) {
    for (const terminalView of this.terminalViews) {
      if (terminalView) {
        if (terminalView.getTerminal() === terminal) {
          return terminalView
        }
      }
    }

    return null
  }

  runInActiveView(callback) {
    const view = this.getActiveTerminalView()
    if (view) {
      return callback(view)
    }
    return null
  }

  runNewTerminal() {
    this.activeTerminal = this.createEmptyTerminalView()
    this.activeTerminal.toggle()
    return this.activeTerminal
  }

  runCommandInNewTerminal(commands) {
    this.activeTerminal = this.createTerminalView(commands)
    this.activeTerminal.toggle()
    return this.activeTerminal
  }

  runInOpenView(callback) {
    const view = this.getActiveTerminalView()
    if (view && view.panel.isVisible()) {
      return callback(view)
    }
    return null
  }

  setActiveTerminalView(view) {
    this.activeTerminal = view
  }

  removeTerminalView(view) {
    const index = this.indexOf(view)
    if (index < 0) {
      return
    }
    this.terminalViews.splice(index, 1)

    this.activateAdjacentTerminal(index)
  }

  activateAdjacentTerminal(index = 0) {
    if (this.terminalViews.length === 0) {
      return false
    }

    index = Math.max(0, index - 1)
    this.activeTerminal = this.terminalViews[index]

    return true
  }

  newTerminalView() {
    if (this.activeTerminal && this.activeTerminal.animating) {
      return
    }

    this.activeTerminal = this.createTerminalView()
    this.activeTerminal.toggle()
  }

  attach() {
    this.statusBarProvider.addLeftTile({ item: this, priority: -93 })
  }

  destroyActiveTerm() {
    if (!this.activeTerminal) {
      return
    }

    const index = this.indexOf(this.activeTerminal)
    this.activeTerminal.destroy()
    this.activeTerminal = null

    this.activateAdjacentTerminal(index)
  }

  closeAll() {
    for (let i = this.terminalViews.length - 1; i >= 0; i--) {
      const view = this.terminalViews[i]
      if (view) {
        view.destroy()
      }
    }
    this.activeTerminal = null
  }

  destroy() {
    this.subscriptions.dispose()
    for (let i = this.terminalViews.length - 1; i >= 0; i--) {
      const view = this.terminalViews[i]
      if (view) {
        view.ptyProcess.terminate()
        view.terminal.destroy()
      }
    }
    this.detach()
  }

  toggle() {
    if (this.terminalViews.length === 0) {
      this.activeTerminal = this.createTerminalView()
    } else if (this.activeTerminal === null) {
      this.activeTerminal = this.terminalViews[0]
    }
    this.activeTerminal.toggle()
  }

  clear() {
    this.destroyActiveTerm()
    this.newTerminalView()
  }

  setStatusColor(event) {
    let color = event.type.match(/\w+$/)[0]
    color = atom.config.get(`terminal.iconColors.${color}`).toRGBAString()
    $(event.target).closest(".terminal-status-icon").css("color", color)
  }

  clearStatusColor(event) {
    $(event.target).closest(".terminal-status-icon").css("color", "")
  }

  onDragStart(event) {
    event.originalEvent.dataTransfer.setData("terminal-panel", "true")

    const element = $(event.target).closest(".terminal-status-icon")
    element.addClass("is-dragging")
    event.originalEvent.dataTransfer.setData("from-index", element.index())
  }

  onDragLeave() {
    this.removePlaceholder()
  }

  onDragEnd() {
    this.clearDropTarget()
  }

  onDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    if (event.originalEvent.dataTransfer.getData("terminal") !== "true") {
      return
    }

    const newDropTargetIndex = this.getDropTargetIndex(event)
    if (!newDropTargetIndex) {
      return
    }
    this.removeDropTargetClasses()
    const statusIcons = this.statusContainer.children(".terminal-status-icon")

    if (newDropTargetIndex < statusIcons.length) {
      const element = statusIcons.eq(newDropTargetIndex).addClass("is-drop-target")
      this.getPlaceholder().insertBefore(element)
    } else {
      const element = statusIcons.eq(newDropTargetIndex - 1).addClass("drop-target-is-after")
      this.getPlaceholder().insertAfter(element)
    }
  }

  onDrop(event) {
    const { dataTransfer } = event.originalEvent
    const panelEvent = dataTransfer.getData("terminal-panel") === "true"
    const tabEvent = dataTransfer.getData("terminal-tab") === "true"
    if (!panelEvent && !tabEvent) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const toIndex = this.getDropTargetIndex(event)
    this.clearDropTarget()

    let fromIndex
    if (tabEvent) {
      fromIndex = parseInt(dataTransfer.getData("sortable-index"))
      const paneIndex = parseInt(dataTransfer.getData("from-pane-index"))
      const pane = atom.workspace.getPanes()[paneIndex]
      const view = pane.itemAtIndex(fromIndex)
      pane.removeItem(view, false)
      view.show()

      view.toggleTabView()
      this.terminalViews.push(view)
      if (view.statusIcon.isActive()) {
        view.open()
      }
      this.statusContainer.append(view.statusIcon)
      fromIndex = this.terminalViews.length - 1
    } else {
      fromIndex = parseInt(dataTransfer.getData("from-index"))
    }
    this.updateOrder(fromIndex, toIndex)
  }

  onDropTabBar(event, pane) {
    const { dataTransfer } = event.originalEvent
    if (dataTransfer.getData("terminal-panel") !== "true") {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    this.clearDropTarget()

    const fromIndex = parseInt(dataTransfer.getData("from-index"))
    const view = this.terminalViews[fromIndex]
    view.css("height", "")
    view.terminal.element.style.height = atom.config.get("terminal.style.defaultPanelHeight")
    // const tabBar = $(event.target).closest('.tab-bar');

    view.toggleTabView()
    this.removeTerminalView(view)
    this.statusContainer.children().eq(fromIndex).detach()
    view.statusIcon.removeTooltip()

    pane.addItem(view, { index: pane.getItems().length })
    pane.activateItem(view)

    view.focus()
  }

  clearDropTarget() {
    const element = this.find(".is-dragging")
    element.removeClass("is-dragging")
    this.removeDropTargetClasses()
    this.removePlaceholder()
  }

  removeDropTargetClasses() {
    this.statusContainer.find(".is-drop-target").removeClass("is-drop-target")
    this.statusContainer.find(".drop-target-is-after").removeClass("drop-target-is-after")
  }

  getDropTargetIndex(event) {
    const target = $(event.target)
    if (this.isPlaceholder(target)) {
      return
    }

    const statusIcons = this.statusContainer.children(".terminal-status-icon")
    let element = target.closest(".terminal-status-icon")
    if (element.length === 0) {
      element = statusIcons.last()
    }

    if (!element.length) {
      return 0
    }

    const elementCenter = element.offset().left + element.width() / 2

    if (event.originalEvent.pageX < elementCenter) {
      return statusIcons.index(element)
    } else if (element.next(".terminal-status-icon").length > 0) {
      return statusIcons.index(element.next(".terminal-status-icon"))
    } else {
      return statusIcons.index(element) + 1
    }
  }

  getPlaceholder() {
    return this.placeholderEl ? this.placeholderEl : (this.placeholderEl = $('<li class="placeholder"></li>'))
  }

  removePlaceholder() {
    if (this.placeholderEl) {
      this.placeholderEl.remove()
    }
    this.placeholderEl = null
  }

  isPlaceholder(element) {
    return element.is(".placeholder")
  }

  iconAtIndex(index) {
    return this.getStatusIcons().eq(index)
  }

  getStatusIcons() {
    return this.statusContainer.children(".terminal-status-icon")
  }

  moveIconToIndex(icon, toIndex) {
    const followingIcon = this.getStatusIcons()[toIndex]
    const container = this.statusContainer[0]
    if (followingIcon) {
      container.insertBefore(icon, followingIcon)
    } else {
      container.appendChild(icon)
    }
  }

  moveTerminalView(fromIndex, toIndex) {
    const activeTerminal = this.getActiveTerminalView()
    const view = this.terminalViews.splice(fromIndex, 1)[0]
    this.terminalViews.splice(toIndex, 0, view)
    this.setActiveTerminalView(activeTerminal)
  }

  updateOrder(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return
    }
    if (fromIndex < toIndex) {
      toIndex--
    }

    const icon = this.getStatusIcons().eq(fromIndex).detach()
    this.moveIconToIndex(icon.get(0), toIndex)
    this.moveTerminalView(fromIndex, toIndex)
    icon.addClass("inserted")
    icon.one("webkitAnimationEnd", () => icon.removeClass("inserted"))
  }
}

StatusBar.prototype.terminalViews = []
StatusBar.prototype.activeTerminal = null
StatusBar.prototype.returnFocus = null

module.exports = StatusBar
