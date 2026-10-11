import { useAppStore } from '../store'
import { PaneShell } from './PaneShell'

export const WebAPIs = () => {
	const webAPIs = useAppStore((state) => state.webAPIs)

	return (
		<PaneShell
			className="web-apis"
			title="Web APIs"
			note="Timers and async work the browser holds off-thread"
			color="var(--color-timer)"
			count={webAPIs.length}
		>
			{webAPIs.length === 0 ? (
				<div className="pane-empty">
					<p>No active Web APIs</p>
					<p className="small">
						setTimeout, DOM events, etc. will appear here
					</p>
				</div>
			) : (
				webAPIs.map((item) => (
					<div key={item.id} className="api-item">
						<div className="item-main">
							<div className="item-name">{item.name}</div>
							{item.timeRemaining != null && (
								<div className="item-delay">
									Timer: {item.timeRemaining}ms
								</div>
							)}
						</div>
						<div className="item-meta-col">
							<span className="item-status-tag tag-webapi">
								Off-thread
							</span>
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
