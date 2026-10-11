import { useEffect, useRef } from 'react'
import {
	Activity,
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Clock,
	Layers,
	SkipBack,
	SkipForward,
	Terminal,
} from 'lucide-react'
import { useAppStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import type { ExecutionStep } from '../types'

const stepTypeBadge = (type: ExecutionStep['type']) => {
	switch (type) {
		case 'function-call':
			return {
				label: 'Executing',
				className: 'badge-executing',
				icon: <Activity size={12} />,
			}
		case 'function-return':
			return {
				label: 'Completed',
				className: 'badge-completed',
				icon: <CheckCircle2 size={12} />,
			}
		case 'callback-queue':
			return {
				label: 'Queued',
				className: 'badge-queued',
				icon: <Layers size={12} />,
			}
		case 'web-api':
			return {
				label: 'Web API',
				className: 'badge-web-api',
				icon: <Clock size={12} />,
			}
		case 'console.log':
			return {
				label: 'Output',
				className: 'badge-output',
				icon: <Terminal size={12} />,
			}
		case 'error':
			return {
				label: 'Failed',
				className: 'badge-failed',
				icon: <AlertCircle size={12} />,
			}
		default:
			return {
				label: 'Step',
				className: 'badge-default',
				icon: <Activity size={12} />,
			}
	}
}

export const StepTimeline = () => {
	const { steps, currentStep, goToStep, step, back } = useAppStore(
		useShallow((state) => ({
			steps: state.steps ?? [],
			currentStep: state.currentStep,
			goToStep: state.goToStep,
			step: state.step,
			back: state.back,
		})),
	)

	const activeChipRef = useRef<HTMLButtonElement | null>(null)
	const trackRef = useRef<HTMLDivElement | null>(null)

	const totalSteps = steps.length
	const hasSteps = totalSteps > 0
	const isAtStart = currentStep === 0
	const isAtEnd = hasSteps && currentStep >= totalSteps

	useEffect(() => {
		if (
			activeChipRef.current &&
			trackRef.current &&
			typeof activeChipRef.current.scrollIntoView === 'function'
		) {
			activeChipRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest',
			})
		}
	}, [currentStep])

	const currentStepData = currentStep > 0 ? steps[currentStep - 1] : undefined

	return (
		<div
			className="step-timeline"
			role="region"
			aria-label="Execution step timeline and snapshot navigator"
		>
			<div className="timeline-header">
				<div className="timeline-title-group">
					<h3 className="timeline-title">Runtime Step Timeline</h3>
					<span className="timeline-step-badge">
						{hasSteps ? (
							<>
								Step <strong>{currentStep}</strong> of{' '}
								<strong>{totalSteps}</strong>
							</>
						) : (
							'No steps recorded'
						)}
					</span>
				</div>

				<div className="timeline-nav-buttons">
					<button
						type="button"
						className="btn-timeline-nav"
						onClick={() => goToStep(0)}
						disabled={!hasSteps || isAtStart}
						aria-label="Jump to start (Step 0)"
						title="Jump to start (Step 0)"
					>
						<SkipBack size={13} />
						<span className="sr-only">Start</span>
					</button>
					<button
						type="button"
						className="btn-timeline-nav"
						onClick={back}
						disabled={!hasSteps || isAtStart}
						aria-label="Previous step"
						title="Previous step"
					>
						<ArrowLeft size={13} />
						<span className="sr-only">Prev</span>
					</button>
					<button
						type="button"
						className="btn-timeline-nav"
						onClick={step}
						disabled={!hasSteps || isAtEnd}
						aria-label="Next step"
						title="Next step"
					>
						<ArrowRight size={13} />
						<span className="sr-only">Next</span>
					</button>
					<button
						type="button"
						className="btn-timeline-nav"
						onClick={() => goToStep(totalSteps)}
						disabled={!hasSteps || isAtEnd}
						aria-label="Jump to end"
						title={`Jump to end (Step ${totalSteps})`}
					>
						<SkipForward size={13} />
						<span className="sr-only">End</span>
					</button>
				</div>
			</div>

			{/* Timeline Range Scrubber */}
			<div className="timeline-scrubber-row">
				<label htmlFor="timeline-scrubber-slider" className="sr-only">
					Execution step slider scrubber
				</label>
				<input
					id="timeline-scrubber-slider"
					type="range"
					min={0}
					max={totalSteps}
					value={currentStep}
					onChange={(e) => goToStep(Number(e.target.value))}
					disabled={!hasSteps}
					className="timeline-slider"
					aria-valuemin={0}
					aria-valuemax={totalSteps}
					aria-valuenow={currentStep}
					aria-label={`Seek execution step, current step ${currentStep} of ${totalSteps}`}
				/>
				<div className="timeline-scrubber-labels">
					<span>Initial (0)</span>
					{currentStepData && (
						<span className="timeline-current-meta">
							{currentStepData.lineNumber != null && (
								<span className="timeline-line-pill">
									Line {currentStepData.lineNumber}
								</span>
							)}
							<span
								className={`timeline-type-pill ${
									stepTypeBadge(currentStepData.type).className
								}`}
							>
								{stepTypeBadge(currentStepData.type).label}
							</span>
						</span>
					)}
					<span>End ({totalSteps})</span>
				</div>
			</div>

			{/* Snapshot Step Markers / Pills */}
			{!hasSteps ? (
				<div className="timeline-empty">
					<p>No execution trace recorded.</p>
					<span className="small">
						Write or select JavaScript code above to inspect execution steps.
					</span>
				</div>
			) : (
				<div className="timeline-track" ref={trackRef} role="tablist" aria-label="Execution steps list">
					<button
						type="button"
						role="tab"
						aria-selected={currentStep === 0}
						aria-label="Step 0: Initial state"
						className={`timeline-step-chip${currentStep === 0 ? ' active' : ''}`}
						onClick={() => goToStep(0)}
						ref={currentStep === 0 ? activeChipRef : null}
						title="Initial state before execution begins"
					>
						<span className="step-chip-num">0</span>
						<span className="step-chip-name">Initial</span>
					</button>

					{steps.map((s, index) => {
						const stepNum = index + 1
						const isActive = currentStep === stepNum
						const isPast = stepNum < currentStep
						const badge = stepTypeBadge(s.type)

						return (
							<button
								key={s.id || `step-${stepNum}`}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-current={isActive ? 'step' : undefined}
								aria-label={`Step ${stepNum}: ${badge.label}${
									s.lineNumber ? ` (Line ${s.lineNumber})` : ''
								}`}
								className={`timeline-step-chip ${badge.className}${
									isActive ? ' active' : isPast ? ' past' : ' future'
								}`}
								onClick={() => goToStep(stepNum)}
								ref={isActive ? activeChipRef : null}
								title={`Step ${stepNum}: ${s.description}${
									s.lineNumber ? ` (Line ${s.lineNumber})` : ''
								}`}
							>
								<span className="step-chip-num">{stepNum}</span>
								<span className="step-chip-icon" aria-hidden="true">
									{badge.icon}
								</span>
								<span className="step-chip-label">{badge.label}</span>
								{s.lineNumber && (
									<span className="step-chip-line">L{s.lineNumber}</span>
								)}
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}
