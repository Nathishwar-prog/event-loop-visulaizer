import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../index'

describe('Runtime Inspector & Trace Navigation Store', () => {
	beforeEach(() => {
		useAppStore.getState().reset()
	})

	describe('goToStep Navigation', () => {
		it('should seek directly to target step', () => {
			const store = useAppStore.getState()
			expect(store.steps.length).toBeGreaterThan(2)

			store.goToStep(2)

			const state = useAppStore.getState()
			expect(state.currentStep).toBe(2)
			expect(state.isRunning).toBe(false)
		})

		it('should clamp bounds safely below 0 and above total steps', () => {
			const store = useAppStore.getState()
			const total = store.steps.length

			store.goToStep(-5)
			expect(useAppStore.getState().currentStep).toBe(0)

			store.goToStep(total + 10)
			expect(useAppStore.getState().currentStep).toBe(total)
		})

		it('should deterministically rebuild state when stepping backward', () => {
			const store = useAppStore.getState()
			const total = store.steps.length

			store.goToStep(total)
			const endLogsCount = useAppStore.getState().consoleLogs.length

			store.goToStep(0)
			expect(useAppStore.getState().currentStep).toBe(0)
			expect(useAppStore.getState().callStack).toEqual([])
			expect(useAppStore.getState().consoleLogs).toEqual([])

			store.goToStep(total)
			expect(useAppStore.getState().consoleLogs.length).toBe(endLogsCount)
		})
	})

	describe('Playback and Stepping Concurrency Protection', () => {
		it('should stop playback when manual step is called', () => {
			const store = useAppStore.getState()
			store.play()
			expect(useAppStore.getState().isRunning).toBe(true)

			store.step()
			expect(useAppStore.getState().isRunning).toBe(false)
		})

		it('should stop playback when back is called', () => {
			const store = useAppStore.getState()
			store.step()
			store.play()
			expect(useAppStore.getState().isRunning).toBe(true)

			store.back()
			expect(useAppStore.getState().isRunning).toBe(false)
		})

		it('should stop playback when goToStep is called', () => {
			const store = useAppStore.getState()
			store.play()
			expect(useAppStore.getState().isRunning).toBe(true)

			store.goToStep(1)
			expect(useAppStore.getState().isRunning).toBe(false)
		})
	})

	describe('Syntax Errors and Empty Trace Resilience', () => {
		it('should handle empty code string without crashing', () => {
			const store = useAppStore.getState()
			store.setCode('')

			const state = useAppStore.getState()
			expect(state.steps).toEqual([])
			expect(state.currentStep).toBe(0)
			expect(state.callStack).toEqual([])
			expect(state.consoleLogs).toEqual([])

			// Stepping on empty trace should do nothing and not throw
			store.step()
			expect(useAppStore.getState().currentStep).toBe(0)

			store.back()
			expect(useAppStore.getState().currentStep).toBe(0)

			store.goToStep(2)
			expect(useAppStore.getState().currentStep).toBe(0)
		})

		it('should handle syntax error by recording an error step without crashing', () => {
			const store = useAppStore.getState()
			store.setCode('const a = ;')

			const state = useAppStore.getState()
			expect(state.steps.length).toBeGreaterThan(0)
			expect(state.steps[0].type).toBe('error')
			expect(state.steps[0].description).toContain('Execution stopped')

			// Step into error
			store.step()
			const stepped = useAppStore.getState()
			expect(stepped.currentStep).toBe(1)
			expect(stepped.consoleLogs.length).toBeGreaterThan(0)
			expect(stepped.consoleLogs[0].type).toBe('error')
		})
	})

	describe('Async Trace Consistency (Promise & Timers)', () => {
		it('should capture Web APIs and Queue states in order', () => {
			const mixedCode = `console.log('1');
setTimeout(() => { console.log('3'); }, 0);
Promise.resolve().then(() => { console.log('2'); });`

			const store = useAppStore.getState()
			store.setCode(mixedCode)

			const state = useAppStore.getState()
			expect(state.steps.length).toBeGreaterThan(3)

			// Step through to verify queue transitions
			store.goToStep(state.steps.length)
			const finishedLogs = useAppStore.getState().consoleLogs
			expect(finishedLogs.map((l) => l.message)).toEqual(['1', '2', '3'])
		})
	})
})
