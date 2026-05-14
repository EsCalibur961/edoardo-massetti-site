import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

export default function Navbar() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
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
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-white">
          FattiDiretti
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link className={isActive("/") ? "text-white" : ""} to="/">
            Home
          </Link>

          <Link className={isActive("/articles") ? "text-white" : ""} to="/articles">
            Articoli
          </Link>

          <Link className={isActive("/podcasts") ? "text-white" : ""} to="/podcasts">
            Podcast
          </Link>

          <Link className={isActive("/search") ? "text-white" : ""} to="/search">
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
      </div>
    </nav>
  )
}