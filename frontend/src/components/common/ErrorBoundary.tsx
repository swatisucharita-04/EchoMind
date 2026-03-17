/**
 * ErrorBoundary – catches unhandled React render errors.
 * Renders a friendly fallback instead of a blank screen.
 * Place near the top of the component tree in main.tsx or App.tsx.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you'd send this to Sentry / LogRocket etc.
    console.error('[EchoMind ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md w-full text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. Your data is safe — please refresh the page.
          </p>
          <details className="text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Technical details
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-auto text-red-500">
              {this.state.error.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full justify-center"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
