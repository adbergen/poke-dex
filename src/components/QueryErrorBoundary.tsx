'use client'

import { type ReactNode } from 'react'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { AlertTriangle, Wifi } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ErrorBoundary } from './ErrorBoundary'

interface QueryErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function QueryErrorFallback({ error, resetErrorBoundary }: QueryErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          {isNetworkError ? (
            <Wifi className="h-6 w-6 text-amber-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          )}
        </div>
        <CardTitle>{isNetworkError ? 'Connection Error' : 'Data Loading Error'}</CardTitle>
        <CardDescription>
          {isNetworkError
            ? 'Please check your internet connection and try again.'
            : 'There was a problem loading the data. Please try again.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2"
        >
          Try Again
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              Error Details
            </summary>
            <pre className="mt-2 rounded bg-gray-100 p-2 text-xs whitespace-pre-wrap text-gray-800">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

interface QueryErrorBoundaryProps {
  children: ReactNode
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={
            <QueryErrorFallback
              error={new Error('Query error')}
              resetErrorBoundary={reset}
            />
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
