import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { Menu, X } from "lucide-react"

import { auth } from "../firebase"

export default function Navbar() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const location = useLocation()

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl md:text-4xl font-black text-white"
        >
          FattiDiretti
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <Link className={isActive("/") ? "text-white" : ""} to="/">
            Home
          </Link>

          <Link
            className={isActive("/articles") ? "text-white" : ""}
            to="/articles"
          >
            Articoli
          </Link>

          <Link
            className={isActive("/podcasts") ? "text-white" : ""}
            to="/podcasts"
          >
            Podcast
          </Link>

          <Link
            className={isActive("/search") ? "text-white" : ""}
            to="/search"
          >
            Cerca
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="px-5 py-2 rounded-full bg-red-600 text-white font-bold"
            >
              Admin
            </Link>
          )}

          {!user && (
            <>
              <Link to="/register">Registrati</Link>
              <Link to="/login">Login</Link>
            </>
          )}

          {user && (
            <Link
              to="/profile"
              className="px-5 py-2 rounded-full bg-white text-black font-bold"
            >
              Profilo
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white"
        >
          {mobileOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-5 text-white bg-black border-t border-white/10">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>

          <Link to="/articles" onClick={() => setMobileOpen(false)}>
            Articoli
          </Link>

          <Link to="/podcasts" onClick={() => setMobileOpen(false)}>
            Podcast
          </Link>

          <Link to="/search" onClick={() => setMobileOpen(false)}>
            Cerca
          </Link>

          {!user && (
            <>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                Registrati
              </Link>

              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </>
          )}

          {user && (
            <Link to="/profile" onClick={() => setMobileOpen(false)}>
              Profilo
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}