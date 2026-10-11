import { useAppStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import type { ExecutionStep } from '../types'

const phaseLabel = (type: ExecutionStep['type']): string => {
	switch (type) {
		case 'web-api':
			return 'Hand-off'
		case 'callback-queue':
			return 'Queued'
		case 'error':
			return 'Error'
		default:
			return 'Synchronous'
	}
}

const operationStatus = (type: ExecutionStep['type']): string => {
	switch (type) {
		case 'function-call':
			return 'Executing'
		case 'function-return':
			return 'Completed'
		case 'callback-queue':
			return 'Queued'
		case 'web-api':
			return 'Delegated'
		case 'console.log':
			return 'Output'
		case 'error':
			return 'Failed'
		default:
			return 'Executing'
	}
}

export const ExplanationPanel = () => {
	const {
		steps,
		currentStep,
		callStack,
		callbackQueue,
		webAPIs,
		consoleLogs,
	} = useAppStore(
		useShallow((state) => ({
			steps: state.steps,
			currentStep: state.currentStep,
			callStack: state.callStack,
			callbackQueue: state.callbackQueue,
			webAPIs: state.webAPIs,
			consoleLogs: state.consoleLogs,
		})),
	)

	const currentStepData = steps[currentStep - 1]
	const totalSteps = steps.length
	const microtasksCount = callbackQueue.filter(
		(item) => item.type === 'promise',
	).length
	const macrotasksCount = callbackQueue.filter(
		(item) => item.type !== 'promise',
	).length

	// Scope data inspection strictly from trace: never fabricate values
	const scopeData =
		currentStepData?.data && typeof currentStepData.data === 'object'
			? (currentStepData.data as Record<string, unknown>)
			: null
	const hasScopeVariables =
		scopeData !== null && Object.keys(scopeData).length > 0

	const fallbackDescription = currentStepData
		? `Executing step ${currentStep} of ${totalSteps} (${currentStepData.type}): runtime state updated.`
		: 'Click Play or Step to begin execution and see detailed explanations here.'

	return (
		<div
			className="explanation-panel"
			role="region"
			aria-label="Runtime execution step inspector"
		>
			{!currentStepData ? (
				<>
					<div className="explanation-header-row">
						<div className="explanation-phase">Ready</div>
						<span className="explanation-step-count">
							0 / {totalSteps} steps
						</span>
					</div>
					<p className="explanation-text muted">
						Click Play or Step to begin execution and see detailed
						explanations here.
					</p>
				</>
			) : (
				<>
					<div className="explanation-header-row">
						<div className="explanation-badges">
							<span className="explanation-phase">
								{phaseLabel(currentStepData.type)}
							</span>
							<span
								className={`explanation-status-pill status-${operationStatus(
									currentStepData.type,
								).toLowerCase()}`}
							>
								{operationStatus(currentStepData.type)}
							</span>
							{currentStepData.lineNumber != null && (
								<span className="explanation-line-tag">
									Line {currentStepData.lineNumber}
								</span>
							)}
						</div>

						<span className="explanation-step-count">
							Step <strong>{currentStep}</strong> of{' '}
							<strong>{totalSteps}</strong>
						</span>
					</div>

					<p
						key={`${currentStep}-${totalSteps}`}
						className={`explanation-text${
							currentStepData.type === 'error' ? ' error-text' : ''
						}`}
					>
						{currentStepData.description || fallbackDescription}
					</p>

					{/* Runtime Environment / Scope Inspection */}
					<div className="explanation-scope-box">
						<div className="scope-box-header">
							<span className="scope-box-title">Scope & Variables</span>
							<span className="scope-truth-note">Trace Data</span>
						</div>
						{hasScopeVariables ? (
							<div className="scope-variables-list">
								{Object.entries(scopeData).map(([key, val]) => (
									<div key={key} className="scope-variable-row">
										<span className="scope-var-name">{key}:</span>
										<span className="scope-var-value">
											{typeof val === 'object'
												? JSON.stringify(val)
												: String(val)}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="scope-empty-note">
								No local variables captured by interpreter for this
								step.
							</p>
						)}
					</div>

					{/* Runtime Telemetry Summary */}
					<div className="explanation-telemetry-strip">
						<span className="telemetry-pill">
							Stack: <strong>{callStack.length}</strong>
						</span>
						<span className="telemetry-pill">
							Web APIs: <strong>{webAPIs.length}</strong>
						</span>
						<span className="telemetry-pill">
							Microtasks: <strong>{microtasksCount}</strong>
						</span>
						<span className="telemetry-pill">
							Tasks: <strong>{macrotasksCount}</strong>
						</span>
						<span className="telemetry-pill">
							Logs: <strong>{consoleLogs.length}</strong>
						</span>
					</div>
				</>
			)}
		</div>
	)
}
