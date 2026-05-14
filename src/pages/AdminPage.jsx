import Navbar from "../components/Navbar"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-40 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl font-black mb-10">
            Admin FattiDiretti
          </h1>

          <p className="text-white/60">
            Prossimo step: editor articoli professionale.
          </p>
        </div>
      </div>
    </main>
  )
}