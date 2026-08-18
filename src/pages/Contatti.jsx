import { Helmet } from "react-helmet-async"
import { AtSign, Mail } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Contatti() {
  return (
    <>
      <Helmet>
        <title>Contatti | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-14 md:py-20">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Contatti
              </p>
            </div>

            <h1 className="mt-5 text-[48px] font-black leading-none tracking-[-.055em] sm:text-[62px] md:text-[76px]">
              Parliamone.
            </h1>

            <p className="mt-5 max-w-xl text-[16px] leading-7 text-white/42">
              Per segnalazioni, collaborazioni, comunicati o informazioni puoi contattare direttamente la redazione.
            </p>
          </div>
        </section>

        <section className="fd-container py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="mailto:redazione@fattidiretti.com"
              className="group rounded-[20px] border border-white/[0.07] bg-[#101010] p-7 transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:bg-[#121212]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-red-600/10 text-red-500">
                <Mail size={19} />
              </div>

              <p className="mt-7 text-[9px] font-black uppercase tracking-[.2em] text-white/30">
                Redazione
              </p>

              <p className="mt-2 break-all text-[23px] font-black tracking-[-.03em] transition group-hover:text-red-400 sm:text-[26px]">
                redazione@fattidiretti.com
              </p>
            </a>

            <div className="rounded-[20px] border border-white/[0.07] bg-[#101010] p-7">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-red-600/10 text-red-500">
                <AtSign size={19} />
              </div>

              <p className="mt-7 text-[9px] font-black uppercase tracking-[.2em] text-white/30">
                Instagram
              </p>

              <p className="mt-2 text-[23px] font-black tracking-[-.03em] sm:text-[26px]">
                @fattidiretti
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
