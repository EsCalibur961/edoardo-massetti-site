import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { Menu, Search, UserRound, X } from "lucide-react"
import { auth } from "../firebase"

export default function Navbar() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"
  const [user, setUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const linkClass = (path) =>
    `relative py-2 transition after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:origin-left after:bg-red-600 after:transition-transform ${
      location.pathname === path
        ? "text-white after:scale-x-100"
        : "text-white/55 hover:text-white after:scale-x-0 hover:after:scale-x-100"
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070707]/95 backdrop-blur-xl">
      <div className="fd-container flex h-[74px] items-center justify-between gap-5">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="FattiDiretti Home">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-red-600 text-[11px] font-black tracking-[-.04em] text-white shadow-[0_0_26px_rgba(220,38,38,.2)]">
            FD
          </span>
          <span className="text-[24px] font-black tracking-[-0.055em] text-white sm:text-[28px]">
            Fatti<span className="text-red-600">Diretti</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-bold md:flex">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/articles" className={linkClass("/articles")}>Articoli</Link>
          <Link to="/podcasts" className={linkClass("/podcasts")}>Podcast</Link>
          <Link to="/chi-siamo" className={linkClass("/chi-siamo")}>Chi siamo</Link>
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            to="/search"
            aria-label="Cerca"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.09] bg-white/[0.02] text-white/60 transition hover:border-red-500/35 hover:bg-red-500/[0.08] hover:text-red-400"
          >
            <Search size={17} />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[11px] font-black tracking-[.08em] text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              ADMIN
            </Link>
          )}

          <Link
            to={user ? "/profile" : "/login"}
            className="inline-flex min-w-[96px] items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_24px_rgba(220,38,38,.16)] transition hover:bg-red-500"
          >
            <UserRound size={15} />
            <span>{user ? "Profilo" : "Accedi"}</span>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.025] text-white md:hidden"
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.07] bg-[#090909] md:hidden">
          <div className="fd-container flex flex-col py-4 text-base font-bold text-white">
            <Link to="/" className="border-b border-white/[0.07] py-3.5">Home</Link>
            <Link to="/articles" className="border-b border-white/[0.07] py-3.5">Articoli</Link>
            <Link to="/podcasts" className="border-b border-white/[0.07] py-3.5">Podcast</Link>
            <Link to="/search" className="border-b border-white/[0.07] py-3.5">Cerca</Link>
            <Link to="/chi-siamo" className="border-b border-white/[0.07] py-3.5">Chi siamo</Link>
            {isAdmin && <Link to="/admin" className="py-3.5 text-red-500">Admin</Link>}

            <Link
              to={user ? "/profile" : "/login"}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-white"
            >
              <UserRound size={17} />
              {user ? "Profilo" : "Accedi"}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
