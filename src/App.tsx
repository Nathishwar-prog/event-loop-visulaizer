import { useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CodeEditor } from './components/CodeEditor'
import { ExecutionControls } from './components/ExecutionControls'
import { CallStack } from './components/CallStack'
import { CallbackQueue } from './components/CallbackQueue'
import { MicrotaskQueue } from './components/MicrotaskQueue'
import { WebAPIs } from './components/WebAPIs'
import { SampleSelector } from './components/SampleSelector'
import { StepTimeline } from './components/StepTimeline'
import { ExplanationPanel } from './components/ExplanationPanel'
import { Console } from './components/Console'
import { EventLoopNotes } from './components/EventLoopNotes'
import './App.css'

type WorkspaceView = 'all' | 'editor' | 'runtime' | 'console'

function App() {
	const [activeView, setActiveView] = useState<WorkspaceView>('all')

	return (
		<div className="app">
			<Header />

			<main className="main">
				{/* Mobile & Tablet View Selector */}
				<div
					className="workspace-tabs-bar"
					role="tablist"
					aria-label="Workspace layout panes"
				>
					<button
						type="button"
						role="tab"
						aria-selected={activeView === 'all'}
						className={`workspace-tab-btn${activeView === 'all' ? ' active' : ''}`}
						onClick={() => setActiveView('all')}
					>
						Overview
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeView === 'editor'}
						className={`workspace-tab-btn${activeView === 'editor' ? ' active' : ''}`}
						onClick={() => setActiveView('editor')}
					>
						Editor
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeView === 'runtime'}
						className={`workspace-tab-btn${activeView === 'runtime' ? ' active' : ''}`}
						onClick={() => setActiveView('runtime')}
					>
						Queues
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeView === 'console'}
						className={`workspace-tab-btn${activeView === 'console' ? ' active' : ''}`}
						onClick={() => setActiveView('console')}
					>
						Console
					</button>
				</div>

				<div className={`main-grid view-${activeView}`}>
					<div
						className={`left-column${
							activeView === 'all' || activeView === 'editor'
								? ' pane-visible'
								: ' pane-hidden-mobile'
						}`}
					>
						<SampleSelector />
						<ExecutionControls />
						<StepTimeline />
						<CodeEditor />
						<ExplanationPanel />
					</div>

					<div
						className={`right-column${
							activeView === 'all' ||
							activeView === 'runtime' ||
							activeView === 'console'
								? ' pane-visible'
								: ' pane-hidden-mobile'
						}`}
					>
						<div
							className={`visualization-grid${
								activeView === 'console' ? ' pane-hidden-mobile' : ''
							}`}
						>
							<CallStack />
							<WebAPIs />
							<MicrotaskQueue />
							<CallbackQueue />
						</div>

						<div
							className={`console-and-notes${
								activeView === 'runtime' ? ' pane-hidden-mobile' : ''
							}`}
						>
							<Console />
							<EventLoopNotes />
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}

export default App
