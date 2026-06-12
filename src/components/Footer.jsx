import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-6 text-white/50 text-sm bg-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p>© 2026 FattiDiretti</p>
          <p>Giornalismo moderno • Video Podcast • Editoriale</p>
          <p className="mt-2">Email: redazione@fattidiretti.com</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/cookie-policy">Cookie Policy</Link>
          <Link to="/contatti">Contatti</Link>
          <Link to="/chi-siamo">Chi siamo</Link>
        </div>
      </div>
    </footer>
  );
}