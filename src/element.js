/** @babel */

import { CompositeDisposable, Disposable } from 'atom'
import { spawn as spawnPty } from 'node-pty-prebuilt-multiarch'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import { shell } from 'electron'

import { config } from './config'
import { getTheme } from './themes'

import fs from 'fs-extra'

class AtomTerminal extends HTMLElement {
	async initialize (model) {
		this.model = model
		this.model.element = this
		this.disposables = new CompositeDisposable()
		this.pendingTerminalProfileOptions = {}
		this.contentRect = null
		this.initiallyVisible = false
		this.isInitialized = false
		let resolveInit, rejectInit
		this.initializedPromise = new Promise((resolve, reject) => {
			resolveInit = resolve
			rejectInit = reject
		})
		try {
			// Always wait for the model to finish initializing before proceeding.
			await this.model.initializedPromise
			this.setAttribute('session-id', this.model.getSessionId())
			// An element resize detector is used to check when this element is
			// resized due to the pane resizing or due to the entire window
			// resizing.
			const resizeObserver = new ResizeObserver(entries => {
				const lastEntry = entries.pop()
				this.contentRect = lastEntry.contentRect
				this.refitTerminal()
			})
			resizeObserver.observe(this)
			this.disposables.add(new Disposable(() => {
				resizeObserver.disconnect()
			}))
			// Add an IntersectionObserver in order to apply new options and
			// refit as soon as the terminal is visible.
			const intersectionObserver = new IntersectionObserver(async entries => {
				const lastEntry = entries.pop()
				if (lastEntry.intersectionRatio === 1.0) {
					this.initiallyVisible = true
					try {
						await this.createTerminal()
						resolveInit()
					} catch (ex) {
						rejectInit(ex)
					}
					// Remove observer once visible
					intersectionObserver.disconnect()
				}
			}, {
				root: atom.views.getView(atom.workspace),
				threshold: 1.0,
			})
			intersectionObserver.observe(this)
			this.disposables.add(new Disposable(() => {
				intersectionObserver.disconnect()
			}))
			// Add event handler for increasing/decreasing the font when
			// holding 'ctrl' and moving the mouse wheel up or down.
			this.addEventListener(
				'wheel',
				(wheelEvent) => {
					if (!wheelEvent.ctrlKey || !atom.config.get('editor.zoomFontWhenCtrlScrolling')) {
						return
					}

					let fontSize = this.model.fontSize + (wheelEvent.deltaY < 0 ? 1 : -1)
					if (fontSize < config.fontSize.minimum) {
						fontSize = config.fontSize.minimum
					} else if (fontSize > config.fontSize.maximum) {
						fontSize = config.fontSize.maximum
					}
					this.model.fontSize = fontSize
					this.terminal.setOption('fontSize', fontSize)
					wheelEvent.stopPropagation()
				},
				{ capture: true },
			)
		} catch (ex) {
			rejectInit(ex)
			throw ex
		}
		this.isInitialized = true
	}

	destroy () {
		if (this.ptyProcess) {
			this.ptyProcess.kill()
		}
		if (this.terminal) {
			this.terminal.dispose()
		}
		this.disposables.dispose()
	}

	async checkPathIsDirectory (path) {
		if (path) {
			try {
				const stats = await fs.stat(path)
				if (stats && stats.isDirectory()) {
					return true
				}
			} catch (err) {}
		}

		return false
	}

	async getCwd () {
		const cwd = this.model.cwd
		if (await this.checkPathIsDirectory(cwd)) {
			return cwd
		}

		// If the cwd from the model was invalid, reset it to null.
		this.model.cwd = null

		return null
	}

	getEnv () {
		const env = { ...process.env }
		delete env.NODE_ENV
		return env
	}

	isPtyProcessRunning () {
		return (this.ptyProcess && this.ptyProcessRunning)
	}

	getXtermOptions () {
		const xtermOptions = {
			cursorBlink: true,
		}
		xtermOptions.fontSize = atom.config.get('terminal.fontSize')
		xtermOptions.fontFamily = atom.config.get('terminal.fontFamily')
		xtermOptions.theme = getTheme()
		return xtermOptions
	}

	setMainBackgroundColor () {
		const theme = getTheme()
		if (theme && theme.background) {
			this.style.backgroundColor = theme.background
		} else {
			this.style.backgroundColor = '#000000'
		}
	}

	loadAddons () {
		this.fitAddon = new FitAddon()
		this.terminal.loadAddon(this.fitAddon)
		if (atom.config.get('terminal.webLinks')) {
			this.terminal.loadAddon(new WebLinksAddon((e, uri) => {
				shell.openExternal(uri)
			}))
		}
		this.terminal.open(this)
		if (atom.config.get('terminal.webgl')) {
			this.terminal.loadAddon(new WebglAddon())
		}
	}

	async createTerminal () {
		// Attach terminal emulator to this element and refit.
		this.setMainBackgroundColor()
		this.terminal = new Terminal(this.getXtermOptions())
		this.loadAddons()
		this.terminal.focus()
		this.ptyProcessCols = 80
		this.ptyProcessRows = 25
		this.refitTerminal()
		this.ptyProcess = null
		this.ptyProcessRunning = false
		this.disposables.add(this.terminal.onData((data) => {
			if (this.isPtyProcessRunning()) {
				this.ptyProcess.write(data)
			}
		}))
		this.disposables.add(this.terminal.onSelectionChange(() => {
			if (atom.config.get('terminal.copyOnSelect')) {
				let text = this.terminal.getSelection()
				if (text) {
					const rawLines = text.split(/\r?\n/g)
					const lines = rawLines.map(line => line.replace(/\s/g, ' ').trimRight())
					text = lines.join('\n')
					atom.clipboard.write(text)
				}
			}
		}))
		await this.restartPtyProcess()
	}

	async restartPtyProcess () {
		if (this.ptyProcessRunning) {
			this.ptyProcess.removeAllListeners('exit')
			this.ptyProcess.kill()
		}
		// Reset the terminal.
		this.terminal.reset()

		// Setup pty process.
		this.ptyProcessCommand = atom.config.get('terminal.shell')
		const encoding = atom.config.get('terminal.encoding')

		// Attach pty process to terminal.
		// NOTE: This must be done after the terminal is attached to the
		// parent element and refitted.
		this.ptyProcessOptions = {
			cwd: await this.getCwd(),
			env: this.getEnv(),
		}
		if (encoding) {
			// There's some issue if 'encoding=null' is passed in the options,
			// therefore, only set it if there's an actual encoding to set.
			this.ptyProcessOptions.encoding = encoding
		}

		this.ptyProcessOptions.cols = this.ptyProcessCols
		this.ptyProcessOptions.rows = this.ptyProcessRows
		this.ptyProcess = null
		this.ptyProcessRunning = false
		try {
			this.ptyProcess = spawnPty(this.ptyProcessCommand, [], this.ptyProcessOptions)

			if (this.ptyProcess) {
				this.ptyProcessRunning = true
				this.ptyProcess.on('data', (data) => {
					const oldTitle = this.model.title
					if (process.platform !== 'win32') {
						this.model.title = this.ptyProcess.process
					}
					if (oldTitle !== this.model.title) {
						this.model.emitter.emit('did-change-title', this.model.title)
					}
					this.terminal.write(data)
					this.model.handleNewDataArrival()
				})
				this.ptyProcess.on('exit', (code, signal) => {
					this.ptyProcessRunning = false
					this.model.exit()
				})
			}
		} catch (err) {
			let message = 'Launching \'' + this.ptyProcessCommand + '\' raised the following error: ' + err.message
			if (err.message.startsWith('File not found:')) {
				message = 'Could not find command \'' + this.ptyProcessCommand + '\'.'
			}
			atom.notifications.addError(message)
		}
	}

	refitTerminal () {
		// Only refit the terminal when it is completely visible.
		if (
			this.initiallyVisible &&
			this.contentRect &&
			this.contentRect.width > 0 &&
			this.contentRect.height > 0
		) {
			this.fitAddon.fit()
			const geometry = this.fitAddon.proposeDimensions()
			if (geometry && this.isPtyProcessRunning()) {
				// Resize pty process
				if (this.ptyProcessCols !== geometry.cols || this.ptyProcessRows !== geometry.rows) {
					this.ptyProcess.resize(geometry.cols, geometry.rows)
					this.ptyProcessCols = geometry.cols
					this.ptyProcessRows = geometry.rows
				}
			}
		}
	}

	focusOnTerminal () {
		if (this.terminal) {
			this.model.setActive()
			this.terminal.focus()
		}
	}
}

export const TerminalElement = document.registerElement('atom-terminal', {
	prototype: AtomTerminal.prototype,
})
