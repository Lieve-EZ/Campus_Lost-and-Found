import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Board from './pages/Board'
import PostItem from './pages/PostItem'
import AuthPage from './pages/AuthPage'
import AdminDashboard from './pages/AdminDashboard'
import AccountPage from './pages/AccountPage'

function PageRoutes() {
  const location = useLocation()
  return <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}><Routes location={location}><Route path="/" element={<Home />} /><Route path="/board" element={<Board />} /><Route path="/post" element={<PostItem />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage />} /><Route path="/admin-login" element={<AuthPage />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/account" element={<AccountPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></motion.div></AnimatePresence>
}

export default function App() {
  return <div className="page-write flex min-h-screen flex-col"><Navbar /><div className="flex-1"><PageRoutes /></div><Footer /></div>
}
