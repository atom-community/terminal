import { getTheme } from "../src/themes"

describe("themes", () => {
  describe("getTheme()", () => {
    it("Custom", () => {
      atom.config.set("terminal.colors.theme", "Custom")
      expect(getTheme()).toEqual({
        background: "#000000",
        foreground: "#ffffff",
        selection: "#4d4d4d",
        cursor: "#ffffff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Atom Dark", () => {
      atom.config.set("terminal.colors.theme", "Atom Dark")
      expect(getTheme()).toEqual({
        background: "#1d1f21",
        foreground: "#c5c8c6",
        selection: "#999999",
        cursor: "#ffffff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Atom Light", () => {
      atom.config.set("terminal.colors.theme", "Atom Light")
      expect(getTheme()).toEqual({
        background: "#ffffff",
        foreground: "#555555",
        selection: "#afc4da",
        cursor: "#000000",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Base16 Tomorrow Dark", () => {
      atom.config.set("terminal.colors.theme", "Base16 Tomorrow Dark")
      expect(getTheme()).toEqual({
        background: "#1d1f21",
        foreground: "#c5c8c6",
        selection: "#b4b7b4",
        // selectionForeground: '#e0e0e0',
        cursor: "#ffffff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Base16 Tomorrow Light", () => {
      atom.config.set("terminal.colors.theme", "Base16 Tomorrow Light")
      expect(getTheme()).toEqual({
        background: "#ffffff",
        foreground: "#1d1f21",
        selection: "#282a2e",
        // selectionForeground: '#e0e0e0',
        cursor: "#1d1f21",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Christmas", () => {
      atom.config.set("terminal.colors.theme", "Christmas")
      expect(getTheme()).toEqual({
        background: "#0c0047",
        foreground: "#f81705",
        selection: "#298f16",
        cursor: "#009f59",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("City Lights", () => {
      atom.config.set("terminal.colors.theme", "City Lights")
      expect(getTheme()).toEqual({
        background: "#181d23",
        foreground: "#666d81",
        selection: "#2a2f38",
        // selectionForeground: '#b7c5d3',
        cursor: "#528bff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Dracula", () => {
      atom.config.set("terminal.colors.theme", "Dracula")
      expect(getTheme()).toEqual({
        background: "#1e1f29",
        foreground: "white",
        selection: "#44475a",
        cursor: "#999999",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Grass", () => {
      atom.config.set("terminal.colors.theme", "Grass")
      expect(getTheme()).toEqual({
        background: "rgb(19, 119, 61)",
        foreground: "rgb(255, 240, 165)",
        selection: "rgba(182, 73, 38, .99)",
        cursor: "rgb(142, 40, 0)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Homebrew", () => {
      atom.config.set("terminal.colors.theme", "Homebrew")
      expect(getTheme()).toEqual({
        background: "#000000",
        foreground: "rgb(41, 254, 20)",
        selection: "rgba(7, 30, 155, .99)",
        cursor: "rgb(55, 254, 38)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Inverse", () => {
      atom.config.set("terminal.colors.theme", "Inverse")
      expect(getTheme()).toEqual({
        background: "#ffffff",
        foreground: "#000000",
        selection: "rgba(178, 215, 255, .99)",
        cursor: "rgb(146, 146, 146)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Linux", () => {
      atom.config.set("terminal.colors.theme", "Linux")
      expect(getTheme()).toEqual({
        background: "#000000",
        foreground: "rgb(230, 230, 230)",
        selection: "rgba(155, 30, 7, .99)",
        cursor: "rgb(200, 20, 25)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Man Page", () => {
      atom.config.set("terminal.colors.theme", "Man Page")
      expect(getTheme()).toEqual({
        background: "rgb(254, 244, 156)",
        foreground: "black",
        selection: "rgba(178, 215, 255, .99)",
        cursor: "rgb(146, 146, 146)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Novel", () => {
      atom.config.set("terminal.colors.theme", "Novel")
      expect(getTheme()).toEqual({
        background: "rgb(223, 219, 196)",
        foreground: "rgb(77, 47, 46)",
        selection: "rgba(155, 153, 122, .99)",
        cursor: "rgb(115, 99, 89)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Ocean", () => {
      atom.config.set("terminal.colors.theme", "Ocean")
      expect(getTheme()).toEqual({
        background: "rgb(44, 102, 201)",
        foreground: "white",
        selection: "rgba(41, 134, 255, .99)",
        cursor: "rgb(146, 146, 146)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("One Dark", () => {
      atom.config.set("terminal.colors.theme", "One Dark")
      expect(getTheme()).toEqual({
        background: "#282c34",
        foreground: "#abb2bf",
        selection: "#9196a1",
        cursor: "#528bff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("One Light", () => {
      atom.config.set("terminal.colors.theme", "One Light")
      expect(getTheme()).toEqual({
        background: "hsl(230, 1%, 98%)",
        foreground: "hsl(230, 8%, 24%)",
        selection: "hsl(230, 1%, 90%)",
        cursor: "hsl(230, 100%, 66%)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Predawn", () => {
      atom.config.set("terminal.colors.theme", "Predawn")
      expect(getTheme()).toEqual({
        background: "#282828",
        foreground: "#f1f1f1",
        selection: "rgba(255,255,255,0.25)",
        cursor: "#f18260",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Pro", () => {
      atom.config.set("terminal.colors.theme", "Pro")
      expect(getTheme()).toEqual({
        background: "#000000",
        foreground: "rgb(244, 244, 244)",
        selection: "rgba(82, 82, 82, .99)",
        cursor: "rgb(96, 96, 96)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Red Sands", () => {
      atom.config.set("terminal.colors.theme", "Red Sands")
      expect(getTheme()).toEqual({
        background: "rgb(143, 53, 39)",
        foreground: "rgb(215, 201, 167)",
        selection: "rgba(60, 25, 22, .99)",
        cursor: "white",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Red", () => {
      atom.config.set("terminal.colors.theme", "Red")
      expect(getTheme()).toEqual({
        background: "#000000",
        foreground: "rgb(255, 38, 14)",
        selection: "rgba(7, 30, 155, .99)",
        cursor: "rgb(255, 38, 14)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Silver Aerogel", () => {
      atom.config.set("terminal.colors.theme", "Silver Aerogel")
      expect(getTheme()).toEqual({
        background: "rgb(146, 146, 146)",
        foreground: "#000000",
        selection: "rgba(120, 123, 156, .99)",
        cursor: "rgb(224, 224, 224)",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Solarized Dark", () => {
      atom.config.set("terminal.colors.theme", "Solarized Dark")
      expect(getTheme()).toEqual({
        background: "#042029",
        foreground: "#708284",
        selection: "#839496",
        cursor: "#819090",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Solarized Light", () => {
      atom.config.set("terminal.colors.theme", "Solarized Light")
      expect(getTheme()).toEqual({
        background: "#fdf6e3",
        foreground: "#657a81",
        selection: "#ece7d5",
        cursor: "#586e75",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Solid Colors", () => {
      atom.config.set("terminal.colors.theme", "Solid Colors")
      expect(getTheme()).toEqual({
        background: "rgb(120, 132, 151)",
        foreground: "#000000",
        selection: "rgba(178, 215, 255, .99)",
        cursor: "#ffffff",
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })

    it("Standard", () => {
      atom.config.set("terminal.colors.theme", "Standard")
      const root = getComputedStyle(document.documentElement as HTMLElement)
      expect(getTheme()).toEqual({
        background: root.getPropertyValue("--standard-app-background-color"),
        foreground: root.getPropertyValue("--standard-text-color"),
        selection: root.getPropertyValue("--standard-background-color-selected"),
        cursor: root.getPropertyValue("--standard-text-color-highlight"),
        cursorAccent: "#000000",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec",
      })
    })
  })
})
