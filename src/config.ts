import which from "which"
import { CompositeDisposable } from "atom"

type configObjects = Record<string, configObject>

type configObject = {
  title: string
  description: string
  default?: string | boolean | number
  enum?: (string | number)[]
  minimum?: number
  maximum?: number
  order?: number
  collapsed?: boolean
  type: string
  properties?: configObjects
}

function configOrder(obj: configObjects): configObjects {
  let order = 1
  for (const name in obj) {
    obj[name].order = order++
    if (obj[name].type === "object" && "properties" in obj[name]) {
      configOrder(<configObjects>obj[name].properties)
    }
  }
  return obj
}

// finds the default shell start commmand
export async function getDefaultShell(): Promise<string> {
  let shellStartCommand
  if (process.platform === "win32") {
    // Windows
    try {
      shellStartCommand = await which("pwsh.exe")
      return shellStartCommand
    } catch (e1) {
      try {
        shellStartCommand = await which("powershell.exe")
        return shellStartCommand
      } catch (e2) {
        shellStartCommand = process.env.COMSPEC || "cmd.exe"
        return shellStartCommand
      }
    }
  } else {
    // Unix
    shellStartCommand = process.env.SHELL || "/bin/sh"
    return shellStartCommand
  }
}

// The shell command used in case getDefaultShell does not find a prefered shell
export function getFallbackShell() {
  return process.platform === "win32" ? process.env.COMSPEC || "cmd.exe" : process.env.SHELL || "/bin/sh"
}

// set start command asyncronously
export async function setShellStartCommand(disposables: CompositeDisposable) {
  if (atom.config.get("terminal.autoShell")) {
    const shellStartCommand = await getDefaultShell()
    atom.config.set("terminal.shell", shellStartCommand)
  }
  return disposables.add(
    // an observre that checks if command has been edited manually, if so it will turn autoShell off
    atom.config.observe("terminal.shell", () => {
      atom.config.set("terminal.autoShell", false)
    })
  )
}

export const config = configOrder({
  autoShell: {
    title: "Automatic shell detection",
    description:
      "Automatically detect the prefered shell start command in the next Atom restart. (it will switched off if you edit `shell` option manually.",
    type: "boolean",
    default: true,
  },
  shell: {
    title: "Shell",
    description: "Path to the shell command.",
    type: "string",
    default: getFallbackShell(),
  },
  encoding: {
    title: "Character Encoding",
    description: "Character encoding to use in spawned terminal.",
    type: "string",
    default: "",
  },
  webgl: {
    title: "WebGL Renderer",
    description: "Enable the WebGL-based renderer. Faster but experimental. ⚠️",
    type: "boolean",
    default: false,
  },
  webLinks: {
    title: "Web Links",
    description: "Enable clickable web links.",
    type: "boolean",
    default: true,
  },
  ligatures: {
    title: "Ligatures",
    description: "Enables ligatures support (currently works without WebGL).",
    type: "boolean",
    default: true,
  },
  fontFamily: {
    title: "Font Family",
    description: "Font family used in terminal emulator.",
    type: "string",
    default: atom.config.get("editor.fontFamily") || "monospace",
  },
  fontSize: {
    title: "Font Size",
    description: "Font size used in terminal emulator.",
    type: "integer",
    default: atom.config.get("editor.fontSize") || 14,
    minimum: 8,
    maximum: 100,
  },
  defaultOpenPosition: {
    title: "Default Open Position",
    description: "Position to open terminal through service API or terminal:open.",
    type: "string",
    enum: ["Center", "Split Up", "Split Down", "Split Left", "Split Right", "Bottom Dock", "Left Dock", "Right Dock"],
    default: "Center",
  },
  allowHiddenToStayActive: {
    title: "Allow Hidden Terminal To Stay Active",
    description: "When an active terminal is hidden keep it active until another terminal is focused.",
    type: "boolean",
    default: false,
  },
  runInActive: {
    title: "Run in Active Terminal",
    description: "Whether to run commands from the service API in the active terminal or in a new terminal.",
    type: "boolean",
    default: true,
  },
  allowRelaunchingTerminalsOnStartup: {
    title: "Allow relaunching terminals on startup",
    description: "Whether to allow relaunching terminals on startup.",
    type: "boolean",
    default: false,
  },
  copyOnSelect: {
    title: "Copy On Select",
    description: "Copy text to clipboard on selection.",
    type: "boolean",
    default: false,
  },
  colors: {
    title: "Colors",
    description: "Settings for the terminal colors.",
    type: "object",
    collapsed: true,
    properties: {
      theme: {
        title: "Theme",
        description: "Theme used in terminal emulator.",
        type: "string",
        enum: [
          "Custom",
          "Atom Dark",
          "Atom Light",
          "Base16 Tomorrow Dark",
          "Base16 Tomorrow Light",
          "Christmas",
          "City Lights",
          "Dracula",
          "Grass",
          "Homebrew",
          "Inverse",
          "Linux",
          "Man Page",
          "Novel",
          "Ocean",
          "One Dark",
          "One Light",
          "Predawn",
          "Pro",
          "Red Sands",
          "Red",
          "Silver Aerogel",
          "Solarized Dark",
          "Solarized Light",
          "Solid Colors",
          "Standard",
        ],
        default: "Custom",
      },
      // TODO: add transparency settings?
      foreground: {
        title: "Text Color",
        description: "This will be overridden if the theme is not 'Custom'.",
        type: "color",
        default: "#ffffff",
      },
      background: {
        title: "Background Color",
        description: "This will be overridden if the theme is not 'Custom'.",
        type: "color",
        default: "#000000",
      },
      cursor: {
        title: "Cursor Color",
        description: "Can be transparent. This will be overridden if the theme is not 'Custom'.",
        type: "color",
        default: "#ffffff",
      },
      cursorAccent: {
        title: "Cursor Text Color",
        description: "Can be transparent. This will be overridden if the theme is not 'Custom'.",
        type: "color",
        default: "#000000",
      },
      selection: {
        title: "Selection Background Color",
        description: "Can be transparent. This will be overridden if the theme is not 'Custom'.",
        type: "color",
        default: "#4d4d4d",
      },
      black: {
        title: "ANSI Black",
        description: "`\\x1b[30m`",
        type: "color",
        default: "#2e3436",
      },
      red: {
        title: "ANSI Red",
        description: "`\\x1b[31m`",
        type: "color",
        default: "#cc0000",
      },
      green: {
        title: "ANSI Green",
        description: "`\\x1b[32m`",
        type: "color",
        default: "#4e9a06",
      },
      yellow: {
        title: "ANSI Yellow",
        description: "`\\x1b[33m`",
        type: "color",
        default: "#c4a000",
      },
      blue: {
        title: "ANSI Blue",
        description: "`\\x1b[34m`",
        type: "color",
        default: "#3465a4",
      },
      magenta: {
        title: "ANSI Magenta",
        description: "`\\x1b[35m`",
        type: "color",
        default: "#75507b",
      },
      cyan: {
        title: "ANSI Cyan",
        description: "`\\x1b[36m`",
        type: "color",
        default: "#06989a",
      },
      white: {
        title: "ANSI White",
        description: "`\\x1b[37m`",
        type: "color",
        default: "#d3d7cf",
      },
      brightBlack: {
        title: "ANSI Bright Black",
        description: "`\\x1b[1;30m`",
        type: "color",
        default: "#555753",
      },
      brightRed: {
        title: "ANSI Bright Red",
        description: "`\\x1b[1;31m`",
        type: "color",
        default: "#ef2929",
      },
      brightGreen: {
        title: "ANSI Bright Green",
        description: "`\\x1b[1;32m`",
        type: "color",
        default: "#8ae234",
      },
      brightYellow: {
        title: "ANSI Bright Yellow",
        description: "`\\x1b[1;33m`",
        type: "color",
        default: "#fce94f",
      },
      brightBlue: {
        title: "ANSI Bright Blue",
        description: "`\\x1b[1;34m`",
        type: "color",
        default: "#729fcf",
      },
      brightMagenta: {
        title: "ANSI Bright Magenta",
        description: "`\\x1b[1;35m`",
        type: "color",
        default: "#ad7fa8",
      },
      brightCyan: {
        title: "ANSI Bright Cyan",
        description: "`\\x1b[1;36m`",
        type: "color",
        default: "#34e2e2",
      },
      brightWhite: {
        title: "ANSI Bright White",
        description: "`\\x1b[1;37m`",
        type: "color",
        default: "#eeeeec",
      },
    },
  },
})
