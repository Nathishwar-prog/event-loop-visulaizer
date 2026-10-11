import {
	ArrowLeft,
	ArrowRight,
	Gauge,
	Pause,
	Play,
	RotateCcw,
} from 'lucide-react'
import { useAppStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const SPEEDS = [0.5, 1, 1.5, 2] as const

export const ExecutionControls = () => {
	const {
		isRunning,
		isPaused,
		currentStep,
		steps,
		playbackSpeed,
		play,
		pause,
		step,
		back,
		reset,
		setPlaybackSpeed,
	} = useAppStore(
		useShallow((state) => ({
			isRunning: state.isRunning,
			isPaused: state.isPaused,
			currentStep: state.currentStep,
			steps: state.steps,
			playbackSpeed: state.playbackSpeed ?? 1,
			play: state.play,
			pause: state.pause,
			step: state.step,
			back: state.back,
			reset: state.reset,
			setPlaybackSpeed: state.setPlaybackSpeed ?? (() => {}),
		})),
	)

	const hasSteps = steps.length > 0
	const hasStarted = currentStep > 0
	const isComplete = hasSteps && currentStep >= steps.length
	const isActivelyRunning = isRunning && !isPaused

	const tickLabel = hasSteps
		? `${Math.min(currentStep, steps.length)} / ${steps.length}`
		: '0 / 0'
	const progressPct = hasSteps
		? Math.round((Math.min(currentStep, steps.length) / steps.length) * 100)
		: 0

	const playLabel = isActivelyRunning ? 'Pause' : isComplete ? 'Replay' : 'Play'

	const handlePlayClick = () => {
		if (isActivelyRunning) {
			pause()
			return
		}
		play()
	}

	return (
		<div
			className="execution-controls"
			role="region"
			aria-label="Execution debugger controls"
		>
			<div className="controls-row">
				<div className="controls-buttons">
					<button
						type="button"
						onClick={handlePlayClick}
						disabled={!hasSteps}
						className="control-btn-play"
						aria-label={playLabel}
					>
						{isActivelyRunning ? (
							<Pause size={15} />
						) : isComplete ? (
							<RotateCcw size={15} />
						) : (
							<Play size={15} />
						)}
						{playLabel}
					</button>

					<button
						type="button"
						onClick={step}
						disabled={isComplete || !hasSteps}
						className="control-btn-step"
					>
						Step
						<ArrowRight size={15} />
					</button>

					<button
						type="button"
						onClick={back}
						disabled={!hasStarted}
						className="control-btn-back"
					>
						<ArrowLeft size={15} />
						Back
					</button>

					<button
						type="button"
						onClick={reset}
						disabled={!hasSteps}
						className="control-btn-reset"
					>
						Reset
					</button>
				</div>

				{/* Playback Speed Controls */}
				<div
					className="speed-control-group"
					role="group"
					aria-label="Execution playback speed"
				>
					<span className="speed-icon-label" title="Playback Speed">
						<Gauge size={13} aria-hidden="true" />
						<span className="sr-only">Speed</span>
					</span>
					<div className="speed-buttons">
						{SPEEDS.map((speed) => (
							<button
								key={speed}
								type="button"
								className={`speed-btn${playbackSpeed === speed ? ' active' : ''}`}
								onClick={() => setPlaybackSpeed(speed)}
								aria-pressed={playbackSpeed === speed}
								title={`${speed}x speed`}
							>
								{speed}x
							</button>
						))}
					</div>
				</div>

				<div className="status" aria-live="polite">
					{isComplete ? (
						<>
							<div
								className="status-indicator"
								style={{ backgroundColor: '#10b981' }}
							></div>
							Execution Complete
						</>
					) : isActivelyRunning ? (
						<>
							<div className="status-indicator running"></div>
							Running
						</>
					) : isPaused ? (
						<>
							<div className="status-indicator paused"></div>
							Paused
						</>
					) : hasStarted ? (
						<>
							<div
								className="status-indicator"
								style={{ backgroundColor: '#f59e0b' }}
							></div>
							Stopped
						</>
					) : hasSteps ? (
						<>
							<div
								className="status-indicator"
								style={{ backgroundColor: '#3b82f6' }}
							></div>
							Ready to Start
						</>
					) : (
						<>
							<div
								className="status-indicator"
								style={{ backgroundColor: '#6b7280' }}
							></div>
							No Code Loaded
						</>
					)}
					<span className="tick-label">Tick {tickLabel}</span>
				</div>
			</div>

			<div
				className="progress-track"
				role="progressbar"
				aria-valuenow={progressPct}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Execution progress"
			>
				<div className="progress-fill" style={{ width: `${progressPct}%` }} />
			</div>
		</div>
	)
}
