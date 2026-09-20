import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'campus_lost_found_session'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export default function Navbar() {
  const navigate = useNavigate()
  const session = readSession()

  const handlePostClick = () => {
    if (session?.token) {
      navigate('/post')
      return
    }
    navigate('/login')
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/')
  }

  return <>
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/brand-mark.svg" alt="" className="h-9 w-9" />
          <span className="font-display text-lg font-bold tracking-tight">Campus <span className="text-sage">Lost & Found</span></span>
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/board" className="hidden text-sm font-semibold text-muted transition hover:text-ink sm:block">Browse board</NavLink>
          {session?.user ? (
            <>
              <Link to="/account" className="hidden text-sm font-medium text-ink transition hover:text-sage sm:inline">Hi, {session.user.username}</Link>
              {session.user.role === 'admin' && <Link to="/admin" className="button-secondary h-10 px-4 text-sm">Dashboard</Link>}
              <button type="button" onClick={handleLogout} className="button-secondary h-10 px-4 text-sm">Log out</button>
            </>
          ) : (
            <Link to="/login" className="button-secondary h-10 px-4 text-sm">Login</Link>
          )}
          <motion.div whileTap={{ scale: 0.97 }}>
            <button type="button" onClick={handlePostClick} aria-label="Post an item" title="Post an item" className="button-primary h-10 w-10 px-0 py-0 text-2xl leading-none">+</button>
          </motion.div>
        </nav>
      </div>
    </header>

    {!session?.user || session.user.role !== 'admin' ? (
      <Link to="/admin-login" aria-label="Admin login" title="Admin login" className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-2xl text-paper shadow-lg transition hover:scale-105">⚙</Link>
    ) : null}
  </>
}
