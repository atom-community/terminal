import { ToolBarManager, getToolBarManager } from "atom/tool-bar"

let toolbar: ToolBarManager | undefined = undefined

export function consumeToolBar(getToolBar: getToolBarManager) {
  toolbar = getToolBar("atomic-terminal") // getting toolbar object
  if (atom.config.get("atomic-toolbar.toolbarButton")) {
    addToolbarButton()
  }
}

export function addToolbarButton() {
  if (toolbar) {
    toolbar.addButton({
      icon: "terminal",
      tooltip: "Open Terminal",
      callback: "atomic-terminal:open",
    })
  }
}

export function removeToolbarButton() {
  if (toolbar) {
    toolbar.removeItems()
  }
}
