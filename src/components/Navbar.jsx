import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-2xl font-black text-white">
  <img
    src="/logo.png"
    alt="FattiDiretti logo"
    className="w-8 h-8 object-contain"
  />

  <span>FattiDiretti</span>
</Link>

        <div className="flex gap-6 text-sm text-white/60">
          <Link to="/" className="hover:text-white transition">
            Home
          </Link>

          <a href="/#podcast" className="hover:text-white transition">
            Podcast
          </a>

          <a href="/#register" className="hover:text-white transition">
            Registrati
          </a>

          <Link to="/admin" className="hover:text-white transition">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}