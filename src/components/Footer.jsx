import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white">
      <div className="fd-container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_.8fr_.8fr]">
          <div>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center bg-[#d71920] text-sm font-black">FD</span><span className="ui-title text-2xl font-extrabold tracking-[-.04em]">FattiDiretti</span></div>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/50">Notizie, approfondimenti e conversazioni raccontate con chiarezza. Meno rumore, più fatti.</p>
            <p className="mt-6 text-sm text-white/70">redazione@fattidiretti.com</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-white/35">Esplora</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70"><Link to="/articles">Articoli</Link><Link to="/podcasts">Podcast</Link><Link to="/search">Ricerca</Link><Link to="/chi-siamo">Chi siamo</Link></div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-white/35">Informazioni</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70"><Link to="/contatti">Contatti</Link><Link to="/privacy-policy">Privacy Policy</Link><Link to="/cookie-policy">Cookie Policy</Link></div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 md:flex-row md:justify-between"><p>© 2026 FattiDiretti. Tutti i diritti riservati.</p><p>Informazione indipendente, diretta, leggibile.</p></div>
      </div>
    </footer>
  )
}
