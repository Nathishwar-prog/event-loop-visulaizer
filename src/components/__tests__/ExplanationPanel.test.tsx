import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExplanationPanel } from '../ExplanationPanel'
import { useAppStore } from '../../store'

vi.mock('../../store', () => ({
	useAppStore: vi.fn(),
}))

const mockStoreState = (overrides: Record<string, unknown> = {}) => {
	const defaultState = {
		steps: [
			{
				id: 'step-1',
				type: 'function-call',
				description: 'main() called and added to call stack',
				lineNumber: 1,
			},
			{
				id: 'step-2',
				type: 'web-api',
				description: 'setTimeout registered with Web APIs',
				lineNumber: 2,
			},
			{
				id: 'step-3',
				type: 'error',
				description: 'Execution stopped: ReferenceError: x is not defined',
				lineNumber: 3,
			},
		],
		currentStep: 0,
		callStack: [],
		callbackQueue: [],
		webAPIs: [],
		consoleLogs: [],
		...overrides,
	}

	vi.mocked(useAppStore).mockImplementation(((
		selector?: (s: Record<string, unknown>) => unknown,
	) => (selector ? selector(defaultState) : defaultState)) as typeof useAppStore)

	return defaultState
}

describe('ExplanationPanel / Runtime Inspector Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render Ready state when execution has not started', () => {
		mockStoreState({ currentStep: 0 })
		render(<ExplanationPanel />)

		expect(screen.getByText('Ready')).toBeInTheDocument()
		expect(
			screen.getByText(/Click Play or Step to begin execution/i),
		).toBeInTheDocument()
	})

	it('should render step description and phase badge when on active step', () => {
		mockStoreState({ currentStep: 1 })
		render(<ExplanationPanel />)

		expect(screen.getByText('Synchronous')).toBeInTheDocument()
		expect(screen.getByText('Executing')).toBeInTheDocument()
		expect(
			screen.getByText('main() called and added to call stack'),
		).toBeInTheDocument()
		expect(screen.getByText('Line 1')).toBeInTheDocument()
	})

	it('should render Web API hand-off phase correctly', () => {
		mockStoreState({ currentStep: 2 })
		render(<ExplanationPanel />)

		expect(screen.getByText('Hand-off')).toBeInTheDocument()
		expect(screen.getByText('Delegated')).toBeInTheDocument()
		expect(
			screen.getByText('setTimeout registered with Web APIs'),
		).toBeInTheDocument()
	})

	it('should render error description and failed status badge on error step', () => {
		mockStoreState({ currentStep: 3 })
		render(<ExplanationPanel />)

		expect(screen.getByText('Error')).toBeInTheDocument()
		expect(screen.getByText('Failed')).toBeInTheDocument()
		expect(
			screen.getByText(/ReferenceError: x is not defined/),
		).toBeInTheDocument()
	})

	it('should show honest scope notice when no local variables captured', () => {
		mockStoreState({ currentStep: 1 })
		render(<ExplanationPanel />)

		expect(
			screen.getByText(
				/No local variables captured by interpreter for this step/i,
			),
		).toBeInTheDocument()
	})

	it('should render telemetry counters accurately', () => {
		mockStoreState({
			currentStep: 1,
			callStack: [{ id: 'cs-1', name: 'main()' }],
			webAPIs: [{ id: 'wa-1', name: 'timer', type: 'setTimeout' }],
			callbackQueue: [{ id: 'cq-1', name: 'cb', type: 'timeout' }],
			consoleLogs: [{ id: 'log-1', message: 'hello', type: 'info', timestamp: 1 }],
		})
		render(<ExplanationPanel />)

		expect(screen.getByText('Stack:')).toBeInTheDocument()
		expect(screen.getByText('Web APIs:')).toBeInTheDocument()
		expect(screen.getByText('Tasks:')).toBeInTheDocument()
		expect(screen.getByText('Logs:')).toBeInTheDocument()
	})
})
