'use client'

import Link from 'next/link'

import { LogIn, X } from 'lucide-react'

import { Button } from './ui/button'

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export default function LoginPrompt({
  isOpen,
  onClose,
  message = 'Please log in to save your favorite Pokémon!'
}: LoginPromptProps) {
  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-gray-900">Login Required</h3>

          <p className="mb-6 text-sm text-gray-600">{message}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="flex-1"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Log In
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="mt-4 text-gray-500"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  )
}
