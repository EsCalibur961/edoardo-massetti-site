import { useEffect, useMemo, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowRight, Headphones, Play } from "lucide-react"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function getTimestamp(item) {
  if (item.publishDate) {
    const parts = item.publishDate.split("/")
    if (parts.length === 3) {
      return new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
      ).getTime()
    }
  }

  return item.createdAt?.seconds * 1000 || 0
}

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPodcasts() {
      try {
        const data = await getDocs(collection(db, "podcasts"))

        setPodcasts(
          data.docs
            .map((item) => ({
              id: item.id,
              ...item.data(),
            }))
            .sort((a, b) => getTimestamp(b) - getTimestamp(a))
        )
      } finally {
        setLoading(false)
      }
    }

    loadPodcasts()
  }, [])

  const featured = podcasts[0]
  const remaining = podcasts.slice(1)

  const categories = useMemo(
    () => [...new Set(podcasts.map((item) => item.category).filter(Boolean))],
    [podcasts]
  )

  return (
    <>
      <Helmet>
        <title>Podcast | FattiDiretti</title>
        <meta
          name="description"
          content="Podcast, conversazioni e approfondimenti audio di FattiDiretti."
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-12 md:py-18">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <div className="flex items-center gap-2 text-red-500">
                <Headphones size={15} />
                <span className="text-[10px] font-black uppercase tracking-[.22em]">
                  FattiDiretti Audio
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.42fr] lg:items-end">
              <h1 className="max-w-5xl text-[48px] font-black leading-[.94] tracking-[-.055em] sm:text-[62px] md:text-[76px]">
                Storie da ascoltare.
                <span className="block text-white/28">Senza rumore.</span>
              </h1>

              <p className="max-w-md text-[15px] leading-7 text-white/38 lg:pb-2">
                Conversazioni, interviste e approfondimenti per andare oltre il titolo
                e ascoltare le storie con più tempo e più contesto.
              </p>
            </div>

            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-[9px] font-black uppercase tracking-[.1em] text-white/45"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <section className="fd-container py-12 md:py-16">
            <div className="grid animate-pulse gap-6 lg:grid-cols-[1.25fr_.75fr]">
              <div className="aspect-video rounded-[20px] bg-white/[0.05]" />
              <div>
                <div className="h-4 w-24 bg-white/[0.05]" />
                <div className="mt-5 h-12 w-full bg-white/[0.05]" />
                <div className="mt-3 h-12 w-4/5 bg-white/[0.05]" />
              </div>
            </div>
          </section>
        ) : podcasts.length === 0 ? (
          <section className="fd-container py-14 md:py-20">
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#101010] p-7 sm:p-9 md:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/[0.07] blur-3xl" />

              <div className="relative max-w-2xl">
                <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-red-600 text-white">
                  <Headphones size={21} />
                </div>

                <p className="mt-7 text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                  FattiDiretti Podcast
                </p>

                <h2 className="mt-2 text-[34px] font-black leading-[1] tracking-[-.045em] sm:text-[42px]">
                  I primi episodi stanno arrivando.
                </h2>

                <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/42">
                  Questa sezione è pronta per ospitare podcast, interviste e contenuti
                  video. Quando verrà pubblicato il primo episodio apparirà qui
                  automaticamente.
                </p>

                <Link
                  to="/articles"
                  className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-5 py-3 text-xs font-black text-white/70 transition hover:border-red-500/30 hover:text-red-400"
                >
                  Nel frattempo leggi gli articoli
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Interviste", "Voci, esperienze e conversazioni senza tagli inutili."],
                ["Approfondimenti", "Più contesto sulle storie che meritano tempo."],
                ["Video Podcast", "Episodi da ascoltare o guardare direttamente sul sito."],
              ].map(([title, text], index) => (
                <div
                  key={title}
                  className="rounded-[18px] border border-white/[0.06] bg-white/[0.018] p-5"
                >
                  <span className="text-[9px] font-black tracking-[.16em] text-red-500">
                    0{index + 1}
                  </span>

                  <h3 className="mt-4 text-[18px] font-black tracking-[-.025em]">
                    {title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-white/32">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="fd-container py-12 md:py-16">
              <Link
                to={`/podcast/${featured.slug || featured.id}`}
                className="group grid gap-7 border-b border-white/[0.07] pb-12 lg:grid-cols-[1.22fr_.78fr] lg:items-end"
              >
                <div className="relative aspect-video overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101010]">
                  {featured.coverImage ? (
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm font-black tracking-[.18em] text-white/10">
                      PODCAST
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  <span className="absolute bottom-5 left-5 grid h-13 w-13 place-items-center rounded-full bg-red-600 text-white shadow-xl transition group-hover:scale-105">
                    <Play size={18} fill="currentColor" />
                  </span>
                </div>

                <div className="pb-1">
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                    {featured.category || "In evidenza"}
                  </p>

                  <h2 className="mt-3 text-[35px] font-black leading-[1] tracking-[-.04em] sm:text-[42px]">
                    {featured.title}
                  </h2>

                  {featured.description && (
                    <p className="mt-5 text-[15px] leading-7 text-white/42">
                      {featured.description}
                    </p>
                  )}

                  <div className="mt-7 flex items-center gap-3 text-[11px] font-black text-white/65 transition group-hover:text-red-400">
                    Ascolta / guarda episodio
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </section>

            {remaining.length > 0 && (
              <section className="fd-container pb-16 md:pb-24">
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                      Archivio audio
                    </p>
                    <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                      Tutti gli episodi
                    </h2>
                  </div>

                  <span className="text-xs text-white/25">
                    {podcasts.length} episodi
                  </span>
                </div>

                <div className="grid gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
                  {remaining.map((podcast, index) => (
                    <Link
                      key={podcast.id}
                      to={`/podcast/${podcast.slug || podcast.id}`}
                      className="group"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#101010]">
                        {podcast.coverImage ? (
                          <img
                            src={podcast.coverImage}
                            alt={podcast.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs font-black tracking-[.18em] text-white/10">
                            PODCAST
                          </div>
                        )}

                        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-black tracking-[.1em] text-white">
                          EP. {String(index + 2).padStart(2, "0")}
                        </span>

                        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100">
                          <Play size={14} fill="currentColor" />
                        </span>
                      </div>

                      <p className="mt-4 text-[9px] font-black uppercase tracking-[.18em] text-red-500">
                        {podcast.category || "FattiDiretti Audio"}
                      </p>

                      <h3 className="mt-2 text-[21px] font-black leading-[1.08] tracking-[-.028em] transition group-hover:text-red-400">
                        {podcast.title}
                      </h3>

                      {podcast.description && (
                        <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-white/34">
                          {podcast.description}
                        </p>
                      )}

                      <p className="mt-3 text-[10px] text-white/20">
                        {podcast.publishDate || "FattiDiretti"}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <Footer />
      </main>
    </>
  )
}
