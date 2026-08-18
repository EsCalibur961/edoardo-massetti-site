import { Helmet } from "react-helmet-async"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function ChiSiamo() {
  return (
    <>
      <Helmet>
        <title>Chi siamo | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-14 md:py-20">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Chi siamo
              </p>
            </div>

            <h1 className="mt-5 max-w-5xl text-[46px] font-black leading-[.97] tracking-[-.055em] sm:text-[58px] md:text-[74px]">
              Informazione che
              <span className="block text-white/32">arriva al punto.</span>
            </h1>
          </div>
        </section>

        <section className="fd-container py-12 md:py-18">
          <div className="grid gap-10 border-b border-white/[0.07] pb-12 md:grid-cols-[.9fr_1.1fr] md:gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                Il progetto
              </p>

              <h2 className="mt-3 max-w-xl text-[28px] font-black leading-[1.08] tracking-[-.035em] md:text-[34px]">
                FattiDiretti nasce per raccontare ciò che conta con un linguaggio contemporaneo, chiaro e accessibile.
              </h2>
            </div>

            <div className="space-y-6 text-[17px] leading-8 text-white/52">
              <p>
                News, approfondimenti, podcast, eventi e attualità convivono in uno spazio editoriale pensato per essere leggibile prima ancora che rumoroso.
              </p>

              <p>
                Crediamo nella sintesi quando serve, nel contesto quando conta e nelle storie che meritano di essere raccontate bene.
              </p>
            </div>
          </div>

          <div className="grid gap-6 py-12 md:grid-cols-3">
            {[
              ["Diretti", "Titoli chiari, contenuti leggibili e nessun giro inutile di parole."],
              ["Contemporanei", "Un linguaggio editoriale pensato per il web, i social e le nuove abitudini di lettura."],
              ["Indipendenti", "Uno spazio dove notizie, opinioni e approfondimenti mantengono identità e riconoscibilità."],
            ].map(([title, text], index) => (
              <div
                key={title}
                className="rounded-[18px] border border-white/[0.07] bg-[#101010] p-6"
              >
                <span className="text-[10px] font-black tracking-[.18em] text-red-500">
                  0{index + 1}
                </span>

                <h3 className="mt-5 text-[23px] font-black tracking-[-.03em]">
                  {title}
                </h3>

                <p className="mt-3 text-[14px] leading-7 text-white/42">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
