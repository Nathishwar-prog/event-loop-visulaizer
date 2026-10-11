import { useAppStore } from '../store'
import { PaneShell } from './PaneShell'

export const CallbackQueue = () => {
	const callbackQueue = useAppStore((state) => state.callbackQueue)
	const macrotasks = callbackQueue.filter((item) => item.type !== 'promise')

	return (
		<PaneShell
			className="callback-queue"
			title="Callback Queue"
			note="Macrotasks. One per tick, after microtasks."
			color="var(--color-stack)"
			count={macrotasks.length}
		>
			{macrotasks.length === 0 ? (
				<div className="pane-empty">
					<p>Callback queue is empty</p>
					<p className="small">
						Callbacks will queue here after Web APIs
					</p>
				</div>
			) : (
				macrotasks.map((item) => (
					<div key={item.id} className="queue-item">
						<div className="item-main">
							<div className="item-name">{item.name}</div>
							{item.delay != null && (
								<div className="item-delay">Delay: {item.delay}ms</div>
							)}
						</div>
						<div className="item-meta-col">
							<span className="item-status-tag tag-queued">Queued</span>
							{item.lineNumber && (
								<div className="item-details">
									Line {item.lineNumber}
								</div>
							)}
						</div>
					</div>
				))
			)}
		</PaneShell>
	)
}
