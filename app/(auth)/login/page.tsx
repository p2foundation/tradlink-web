'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { setTokens } from '@/lib/auth-tokens'
import { useToast } from '@/hooks/use-toast'
import { useNavigation } from '@/hooks/use-navigation'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { navigate, isNavigating } = useNavigation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = response.data
      setTokens({ accessToken, refreshToken, remember })
      localStorage.setItem('user', JSON.stringify(user))

      toast({
        variant: 'success',
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })

      // Small delay to show toast, then navigate
      setTimeout(() => {
        navigate('/dashboard')
      }, 300)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
        duration: 10000, // 10 seconds for error messages so users can read them
      })
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900/60 px-4 py-10 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_rgba(15,23,42,0))]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            TradeLink+
            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
            Secure Access
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Welcome back to the AI-driven trade network
          </h1>
          <p className="max-w-xl text-lg text-slate-200/80">
            Sign in to access real-time market intelligence, trusted buyer-seller matches,
            and premium export workflows designed for global standards.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200/80">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live market insights
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Secure payments
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Verified partners
            </span>
          </div>
        </div>

        <Card className="relative w-full max-w-lg border-white/10 bg-slate-900/70 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl font-semibold text-white">Sign in</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-lg border-slate-800 bg-slate-900/80 pr-10 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:text-emerald-400"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  Remember me
                </label>
                <Link href="/register" className="text-emerald-300 transition hover:text-emerald-200">
                  Create account
                </Link>
              </div>
              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-emerald-500 text-slate-950 shadow-[0_10px_40px_rgba(16,185,129,0.35)] transition hover:translate-y-[-1px] hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-0"
                disabled={loading || isNavigating}
              >
                {loading || isNavigating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

