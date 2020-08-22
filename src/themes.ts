/**
 * Get xTerm.js theme based on settings
 * @return {object} xTerm.js theme object
 */
export function getTheme(): Record<string, string> {
  const { theme, ...colors } = atom.config.get("terminal.colors")
  // themes modified from https://github.com/bus-stop/terminus/tree/master/styles/themes
  switch (theme) {
    case "Atom Dark":
      colors.background = "#1d1f21"
      colors.foreground = "#c5c8c6"
      colors.selection = "#999999"
      colors.cursor = "#ffffff"
      break
    case "Atom Light":
      colors.background = "#ffffff"
      colors.foreground = "#555555"
      colors.selection = "#afc4da"
      colors.cursor = "#000000"
      break
    case "Base16 Tomorrow Dark":
      colors.background = "#1d1f21"
      colors.foreground = "#c5c8c6"
      colors.selection = "#b4b7b4"
      // colors.selectionForeground = '#e0e0e0'
      colors.cursor = "#ffffff"
      break
    case "Base16 Tomorrow Light":
      colors.background = "#ffffff"
      colors.foreground = "#1d1f21"
      colors.selection = "#282a2e"
      // colors.selectionForeground = '#e0e0e0'
      colors.cursor = "#1d1f21"
      break
    case "Christmas":
      colors.background = "#0c0047"
      colors.foreground = "#f81705"
      colors.selection = "#298f16"
      colors.cursor = "#009f59"
      break
    case "City Lights":
      colors.background = "#181d23"
      colors.foreground = "#666d81"
      colors.selection = "#2a2f38"
      // colors.selectionForeground = '#b7c5d3'
      colors.cursor = "#528bff"
      break
    case "Dracula":
      colors.background = "#1e1f29"
      colors.foreground = "white"
      colors.selection = "#44475a"
      colors.cursor = "#999999"
      break
    case "Grass":
      colors.background = "rgb(19, 119, 61)"
      colors.foreground = "rgb(255, 240, 165)"
      colors.selection = "rgba(182, 73, 38, .99)"
      colors.cursor = "rgb(142, 40, 0)"
      break
    case "Homebrew":
      colors.background = "#000000"
      colors.foreground = "rgb(41, 254, 20)"
      colors.selection = "rgba(7, 30, 155, .99)"
      colors.cursor = "rgb(55, 254, 38)"
      break
    case "Inverse":
      colors.background = "#ffffff"
      colors.foreground = "#000000"
      colors.selection = "rgba(178, 215, 255, .99)"
      colors.cursor = "rgb(146, 146, 146)"
      break
    case "Linux":
      colors.background = "#000000"
      colors.foreground = "rgb(230, 230, 230)"
      colors.selection = "rgba(155, 30, 7, .99)"
      colors.cursor = "rgb(200, 20, 25)"
      break
    case "Man Page":
      colors.background = "rgb(254, 244, 156)"
      colors.foreground = "black"
      colors.selection = "rgba(178, 215, 255, .99)"
      colors.cursor = "rgb(146, 146, 146)"
      break
    case "Novel":
      colors.background = "rgb(223, 219, 196)"
      colors.foreground = "rgb(77, 47, 46)"
      colors.selection = "rgba(155, 153, 122, .99)"
      colors.cursor = "rgb(115, 99, 89)"
      break
    case "Ocean":
      colors.background = "rgb(44, 102, 201)"
      colors.foreground = "white"
      colors.selection = "rgba(41, 134, 255, .99)"
      colors.cursor = "rgb(146, 146, 146)"
      break
    case "One Dark":
      colors.background = "#282c34"
      colors.foreground = "#abb2bf"
      colors.selection = "#9196a1"
      colors.cursor = "#528bff"
      break
    case "One Light":
      colors.background = "hsl(230, 1%, 98%)"
      colors.foreground = "hsl(230, 8%, 24%)"
      colors.selection = "hsl(230, 1%, 90%)"
      colors.cursor = "hsl(230, 100%, 66%)"
      break
    case "Predawn":
      colors.background = "#282828"
      colors.foreground = "#f1f1f1"
      colors.selection = "rgba(255,255,255,0.25)"
      colors.cursor = "#f18260"
      break
    case "Pro":
      colors.background = "#000000"
      colors.foreground = "rgb(244, 244, 244)"
      colors.selection = "rgba(82, 82, 82, .99)"
      colors.cursor = "rgb(96, 96, 96)"
      break
    case "Red Sands":
      colors.background = "rgb(143, 53, 39)"
      colors.foreground = "rgb(215, 201, 167)"
      colors.selection = "rgba(60, 25, 22, .99)"
      colors.cursor = "white"
      break
    case "Red":
      colors.background = "#000000"
      colors.foreground = "rgb(255, 38, 14)"
      colors.selection = "rgba(7, 30, 155, .99)"
      colors.cursor = "rgb(255, 38, 14)"
      break
    case "Silver Aerogel":
      colors.background = "rgb(146, 146, 146)"
      colors.foreground = "#000000"
      colors.selection = "rgba(120, 123, 156, .99)"
      colors.cursor = "rgb(224, 224, 224)"
      break
    case "Solarized Dark":
      colors.background = "#042029"
      colors.foreground = "#708284"
      colors.selection = "#839496"
      colors.cursor = "#819090"
      break
    case "Solarized Light":
      colors.background = "#fdf6e3"
      colors.foreground = "#657a81"
      colors.selection = "#ece7d5"
      colors.cursor = "#586e75"
      break
    case "Solid Colors":
      colors.background = "rgb(120, 132, 151)"
      colors.foreground = "#000000"
      colors.selection = "rgba(178, 215, 255, .99)"
      colors.cursor = "#ffffff"
      break
    case "Standard": {
      if (document.documentElement !== null) {
        const root = getComputedStyle(document.documentElement)
        colors.background = root.getPropertyValue("--standard-app-background-color")
        colors.foreground = root.getPropertyValue("--standard-text-color")
        colors.selection = root.getPropertyValue("--standard-background-color-selected")
        colors.cursor = root.getPropertyValue("--standard-text-color-highlight")
      }
      break
    }
  }

  return colors
}
