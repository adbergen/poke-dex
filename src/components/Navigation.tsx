'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LogOut, User } from 'lucide-react'

import { signOut, useSession } from '@/lib/auth-client'

import { Button } from '@/components/ui/button'

export default function Navigation() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900"
            >
              Pokédex
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isPending || !session ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  className={isPending ? 'opacity-50' : ''}
                  asChild={!isPending}
                >
                  {isPending ? 'Sign in' : <Link href="/login">Sign in</Link>}
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  className={isPending ? 'opacity-50' : ''}
                  asChild={!isPending}
                >
                  {isPending ? 'Sign up' : <Link href="/register">Sign up</Link>}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{session.user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
