import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swap for a real error-reporting call (Sentry, etc.) in production.
    console.error('Permissable crashed:', error, info.componentStack)
  }

  handleReset = () => {
    // The graph itself lives in localStorage via zustand/persist, so a
    // reload alone recovers cleanly in the vast majority of cases — no
    // need to nuke saved data just because a render threw once.
    this.setState({ error: null })
    window.location.reload()
  }

  handleClearAndReset = () => {
    localStorage.removeItem('permissable-graph')
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-neutral-950 text-neutral-100 p-6">
          <div className="max-w-md text-center">
            <AlertTriangle className="mx-auto mb-4 text-amber-400" size={32} />
            <h1 className="text-lg font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-neutral-400 mb-6">
              Permissable hit an unexpected error while rendering. Your saved graph is untouched — reloading
              usually fixes this.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-violet-700 hover:bg-violet-600 font-medium"
              >
                <RotateCcw size={14} />
                Reload
              </button>
              <button
                onClick={this.handleClearAndReset}
                className="text-sm px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-900 text-neutral-400"
              >
                Reset saved graph
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
