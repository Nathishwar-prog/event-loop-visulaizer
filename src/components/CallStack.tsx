import { useAppStore } from '../store'
import { PaneShell } from './PaneShell'

export const CallStack = () => {
	const callStack = useAppStore((state) => state.callStack)
	const frames = callStack.slice().reverse()

	return (
		<PaneShell
			className="call-stack"
			title="Call Stack"
			note="What's executing right now, most recent on top"
			color="var(--color-text)"
			count={frames.length}
		>
			{frames.length === 0 ? (
				<div className="pane-empty">
					<p>Call stack is empty</p>
					<p className="small">
						Functions will appear here when called
					</p>
				</div>
			) : (
				frames.map((item, index) => {
					const isTop = index === 0
					return (
						<div
							key={item.id}
							className={`stack-item${isTop ? ' active' : ''}`}
						>
							<div className="item-main">
								<div className="item-name">{item.name}</div>
								{item.args && item.args.length > 0 && (
									<div className="item-args">
										({item.args.map((a) => String(a)).join(', ')})
									</div>
								)}
							</div>
							<div className="item-meta-col">
								<span
									className={`item-status-tag ${
										isTop ? 'tag-executing' : 'tag-waiting'
									}`}
								>
									{isTop ? 'Executing' : 'Caller'}
								</span>
								{item.lineNumber && (
									<div className="item-details">
										Line {item.lineNumber}
									</div>
								)}
							</div>
						</div>
					)
				})
			)}
		</PaneShell>
	)
}
