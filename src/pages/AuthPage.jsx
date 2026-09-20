import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser, loginAdmin, registerUser } from '../api/auth'

const STORAGE_KEY = 'campus_lost_found_session'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const adminMode = location.pathname === '/admin-login'
  const registerMode = location.pathname === '/register'
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.token) {
        navigate(parsed.user?.role === 'admin' ? '/admin' : '/post', { replace: true })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const authFn = adminMode ? loginAdmin : registerMode ? registerUser : loginUser
      const session = await authFn(form)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      navigate(adminMode ? '/admin' : '/post', { replace: true })
    } catch (err) {
      const detail = err?.response?.data?.detail
      const readableDetail = Array.isArray(detail) ? detail[0]?.msg : detail
      setError(readableDetail || (registerMode ? 'We could not create your account. Please try again.' : 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
      <div className="auth-shell overflow-hidden rounded-2xl border border-ink/10 shadow-paper">
        <section className="auth-story relative flex min-h-[560px] flex-col justify-between p-7 text-paper sm:p-10 lg:p-12">
          <div className="relative z-10 flex items-center justify-between">
            <span className="rounded-full border border-paper/20 bg-paper/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">Campus noticeboard</span>
          </div>
          <div className="relative z-10 max-w-md">
            <p className="eyebrow text-sage-light">A little help goes a long way</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">Good things find their way back.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-paper/70">Join the campus network for lost and found items. Post a clear note, follow up with your community, and close the loop.</p>
          </div>
          <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-paper/15 pt-5 text-sm">
            <div><span className="block font-display text-2xl font-bold">24/7</span><span className="text-paper/60">Community access</span></div>
            <div><span className="block font-display text-2xl font-bold">Local</span><span className="text-paper/60">Campus-first matching</span></div>
          </div>
        </section>

        <section className="bg-paper p-7 sm:p-10 lg:p-12">
          <div className="mb-8 flex items-center gap-2 border-b border-line pb-4 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-sage" />
            {adminMode ? 'Staff workspace' : 'Community workspace'}
          </div>
          <p className="eyebrow">{adminMode ? 'Admin access' : registerMode ? 'Create account' : 'Member login'}</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {adminMode ? 'Welcome back, staff.' : registerMode ? 'Start with your account.' : 'Welcome back.'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {adminMode
              ? 'Sign in to keep the campus board organized and up to date.'
              : registerMode ? 'Create a campus account to post and manage lost or found items.' : 'Sign in to post an item and manage your own listings.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-semibold">
              {registerMode ? 'Username' : 'Username, email, or phone'}
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                className="field"
                placeholder={adminMode ? 'admin' : registerMode ? 'Choose a username' : 'Enter username, email, or phone'}
                autoComplete={registerMode ? 'username' : 'username'}
                required
              />
            </label>

            {registerMode && (
              <>
                <label className="block text-sm font-semibold">
                  Email address
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="field"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Phone number
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="field"
                    placeholder="+1 555 123 4567"
                    autoComplete="tel"
                    pattern="[+0-9 ()-]{7,30}"
                    title="Enter a valid phone number."
                    required
                  />
                </label>
              </>
            )}

            <label className="block text-sm font-semibold">
              Password
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="field mt-0 pr-20"
                  placeholder="Enter password"
                  autoComplete={registerMode ? 'new-password' : 'current-password'}
                  required
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted transition hover:text-ink">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && <p role="alert" className="rounded-sm border border-lost/30 bg-lost-soft px-3 py-2 text-sm text-lost">{error}</p>}

            <button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Working...' : adminMode ? 'Open admin dashboard' : registerMode ? 'Create account' : 'Login to post'}
            </button>
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            {adminMode ? (
              <Link to="/post" className="font-semibold text-ink underline underline-offset-4">Return to public posting</Link>
            ) : registerMode ? (
              <span>Already have an account? <Link to="/login" className="font-semibold text-ink underline underline-offset-4">Log in</Link></span>
            ) : (
              <span>New to the board? <Link to="/register" className="font-semibold text-ink underline underline-offset-4">Create an account</Link></span>
            )}
            {!adminMode && <Link to="/board" className="font-semibold text-ink underline underline-offset-4">Browse without logging in</Link>}
            {adminMode && <span>Secure staff access</span>}
          </div>
        </section>
      </div>
    </main>
  )
}
