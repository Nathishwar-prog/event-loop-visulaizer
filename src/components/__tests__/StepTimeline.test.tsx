import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepTimeline } from '../StepTimeline'
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
				description: 'Call foo()',
				lineNumber: 1,
			},
			{
				id: 'step-2',
				type: 'web-api',
				description: 'Register timer',
				lineNumber: 2,
			},
			{
				id: 'step-3',
				type: 'callback-queue',
				description: 'Queue callback',
				lineNumber: 2,
			},
			{
				id: 'step-4',
				type: 'function-return',
				description: 'Return foo',
				lineNumber: 3,
			},
		],
		currentStep: 0,
		goToStep: vi.fn(),
		step: vi.fn(),
		back: vi.fn(),
		...overrides,
	}

	vi.mocked(useAppStore).mockImplementation(((
		selector?: (s: Record<string, unknown>) => unknown,
	) => (selector ? selector(defaultState) : defaultState)) as typeof useAppStore)

	return defaultState
}

describe('StepTimeline Component', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render step count and title correctly', () => {
		mockStoreState({ currentStep: 0 })
		render(<StepTimeline />)

		expect(screen.getByText('Runtime Step Timeline')).toBeInTheDocument()
		expect(
			screen.getByText((_, el) => el?.textContent?.trim() === 'Step 0 of 4'),
		).toBeInTheDocument()
	})

	it('should disable start and back navigation buttons when at step 0', () => {
		mockStoreState({ currentStep: 0 })
		render(<StepTimeline />)

		expect(screen.getByRole('button', { name: /jump to start/i })).toBeDisabled()
		expect(screen.getByRole('button', { name: /previous step/i })).toBeDisabled()
		expect(screen.getByRole('button', { name: /next step/i })).toBeEnabled()
	})

	it('should invoke goToStep when clicking a step chip', () => {
		const state = mockStoreState({ currentStep: 1 })
		render(<StepTimeline />)

		const step2Chip = screen.getByRole('tab', { name: /step 2/i })
		fireEvent.click(step2Chip)

		expect(state.goToStep).toHaveBeenCalledWith(2)
	})

	it('should invoke goToStep(0) when clicking initial state chip', () => {
		const state = mockStoreState({ currentStep: 2 })
		render(<StepTimeline />)

		const initialChip = screen.getByRole('tab', { name: /initial/i })
		fireEvent.click(initialChip)

		expect(state.goToStep).toHaveBeenCalledWith(0)
	})

	it('should invoke goToStep when scrubbing the range input', () => {
		const state = mockStoreState({ currentStep: 1 })
		render(<StepTimeline />)

		const slider = screen.getByLabelText(/seek execution step/i)
		fireEvent.change(slider, { target: { value: '3' } })

		expect(state.goToStep).toHaveBeenCalledWith(3)
	})

	it('should display empty message when no steps exist', () => {
		mockStoreState({ steps: [], currentStep: 0 })
		render(<StepTimeline />)

		expect(screen.getByText(/no execution trace recorded/i)).toBeInTheDocument()
	})
})
