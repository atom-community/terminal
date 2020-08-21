/** @babel */

import { getDefaultShell } from '../src/config'

describe('config', () => {
	describe('getDefaultShell()', () => {
		const savedPlatform = process.platform
		let savedEnv

		beforeEach(() => {
			savedEnv = JSON.parse(JSON.stringify(process.env))
		})

		afterEach(() => {
			process.env = savedEnv
			Object.defineProperty(process, 'platform', {
				value: savedPlatform,
			})
		})

		it('on win32 without COMSPEC set', () => {
			Object.defineProperty(process, 'platform', {
				value: 'win32',
			})
			if (process.env.COMSPEC) {
				delete process.env.COMSPEC
			}
			expect(getDefaultShell()).toBe('cmd.exe')
		})

		it('on win32 with COMSPEC set', () => {
			Object.defineProperty(process, 'platform', {
				value: 'win32',
			})
			const expected = 'somecommand.exe'
			process.env.COMSPEC = expected
			expect(getDefaultShell()).toBe(expected)
		})

		it('on linux without SHELL set', () => {
			Object.defineProperty(process, 'platform', {
				value: 'linux',
			})
			if (process.env.SHELL) {
				delete process.env.SHELL
			}
			expect(getDefaultShell()).toBe('/bin/sh')
		})

		it('on linux with SHELL set', () => {
			Object.defineProperty(process, 'platform', {
				value: 'linux',
			})
			const expected = 'somecommand'
			process.env.SHELL = expected
			expect(getDefaultShell()).toBe(expected)
		})
	})
})
