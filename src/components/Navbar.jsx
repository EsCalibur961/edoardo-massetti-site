import { useEffect, useState } from "react"

import {
  Link,
  useLocation,
} from "react-router-dom"

import {
  onAuthStateChanged,
} from "firebase/auth"

import { auth } from "../firebase"

export default function Navbar() {
  const [user, setUser] =
    useState(null)

  const location = useLocation()

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser)
        }
      )

    return () => unsubscribe()
  }, [])

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-black text-white"
        >
          FattiDiretti
        </Link>

        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link
            to="/"
            className={`transition hover:text-white ${
              isActive("/")
                ? "text-white"
                : ""
            }`}
          >
            Home
          </Link>

          <Link
            to="/articles"
            className={`transition hover:text-white ${
              isActive(
                "/articles"
              )
                ? "text-white"
                : ""
            }`}
          >
            Articoli
          </Link>

          <Link
            to="/podcasts"
            className={`transition hover:text-white ${
              isActive(
                "/podcasts"
              )
                ? "text-white"
                : ""
            }`}
          >
            Podcast
          </Link>

          <Link
            to="/search"
            className={`transition hover:text-white ${
              isActive("/search")
                ? "text-white"
                : ""
            }`}
          >
            Cerca
          </Link>

          {!user && (
            <>
              <Link
                to="/register"
                className={`transition hover:text-white ${
                  isActive(
                    "/register"
                  )
                    ? "text-white"
                    : ""
                }`}
              >
                Registrati
              </Link>

              <Link
                to="/login"
                className={`transition hover:text-white ${
                  isActive(
                    "/login"
                  )
                    ? "text-white"
                    : ""
                }`}
              >
                Login
              </Link>
            </>
          )}

          {user && (
            <Link
              to="/profile"
              className={`px-5 py-2 rounded-full bg-white text-black font-bold transition ${
                isActive(
                  "/profile"
                )
                  ? "opacity-100"
                  : "hover:opacity-80"
              }`}
            >
              Profilo
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}