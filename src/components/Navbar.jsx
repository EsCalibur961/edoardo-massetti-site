import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-white">
          FattiDiretti
        </Link>

       <div className="flex gap-6 text-sm text-white/60">
  <Link to="/" className="hover:text-white transition">Home</Link>
  <Link to="/articles" className="hover:text-white transition">Articoli</Link>
  <Link to="/podcasts" className="hover:text-white transition">Podcast</Link>
  <Link to="/search" className="hover:text-white transition">Cerca</Link>
  <Link to="/register" className="hover:text-white transition">Registrati</Link>
  <Link to="/login" className="hover:text-white transition">Login</Link>
</div>
      </div>
    </nav>
  )
}