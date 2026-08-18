import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { ArrowRight, Headphones } from "lucide-react"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

function getTimestamp(item) {
  if (item.publishDate) {
    const parts = item.publishDate.split("/")
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
    }
  }
  return item.createdAt?.seconds * 1000 || 0
}

function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function Home() {
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [breakingNews, setBreakingNews] = useState({ active: false, text: "", link: "" })

  useEffect(() => {
    async function loadData() {
      const [articlesData, podcastsData, breakingSnap] = await Promise.all([
        getDocs(collection(db, "articles")),
        getDocs(collection(db, "podcasts")),
        getDoc(doc(db, "settings", "breakingNews")),
      ])

      setArticles(
        articlesData.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => getTimestamp(b) - getTimestamp(a))
      )

      setPodcasts(
        podcastsData.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => getTimestamp(b) - getTimestamp(a))
      )

      if (breakingSnap.exists()) {
        setBreakingNews(breakingSnap.data())
      }
    }

    async function trackView() {
      if (sessionStorage.getItem("fattidiretti-viewed")) return

      await setDoc(
        doc(db, "stats", "main"),
        {
          views: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      sessionStorage.setItem("fattidiretti-viewed", "true")
    }

    loadData()
    trackView()
  }, [])

  const featured = articles[0]
  const sideNews = articles.slice(1, 4)
  const leadGrid = articles.slice(4, 9)
  const moreNews = articles.slice(9, 15)

  const categories = useMemo(
    () => [...new Set(articles.map((article) => article.category).filter(Boolean))].slice(0, 8),
    [articles]
  )

  return (
    <>
      <Helmet>
        <title>FattiDiretti | Notizie, articoli e podcast</title>
        <meta
          name="description"
          content="FattiDiretti: notizie, approfondimenti, opinioni e podcast raccontati in modo diretto."
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        {breakingNews.active && breakingNews.text && (
          <div className="border-b border-red-500/20 bg-red-600 text-white">
            <div className="fd-container">
              <Link
                to={breakingNews.link || "/"}
                className="flex items-center gap-3 py-2.5 text-[13px] font-bold"
              >
                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black tracking-[.08em] text-red-600">
                  BREAKING
                </span>
                <span className="line-clamp-1">{breakingNews.text}</span>
                <ArrowRight className="ml-auto shrink-0" size={15} />
              </Link>
            </div>
          </div>
        )}

        <section className="border-b border-white/[0.06]">
          <div className="fd-container py-9 md:py-12">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-red-600" />
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                    In primo piano
                  </p>
                </div>

                <h1 className="mt-3 text-[32px] font-black leading-none tracking-[-.045em] sm:text-[38px] md:text-[43px]">
                  Le notizie di oggi
                </h1>
              </div>

              <Link
                to="/articles"
                className="hidden items-center gap-2 text-[12px] font-bold text-white/45 transition hover:text-red-400 sm:flex"
              >
                Tutti gli articoli <ArrowRight size={14} />
              </Link>
            </div>

            {featured ? (
              <div className="grid gap-6 lg:grid-cols-[1.66fr_.84fr]">
                <Link
                  to={`/articolo/${featured.slug || featured.id}`}
                  className="group relative min-h-[370px] overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101010] md:min-h-[500px]"
                >
                  {featured.coverImage && (
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-[.84] transition duration-1000 group-hover:scale-[1.025]"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/38 to-black/[0.02]" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-9">
                    <span className="text-[9px] font-black uppercase tracking-[.2em] text-red-400">
                      {featured.category || "Notizie"}
                    </span>

                    <h2 className="mt-2.5 max-w-[850px] text-[29px] font-black leading-[1.02] tracking-[-.038em] sm:text-[37px] md:text-[43px]">
                      {featured.title}
                    </h2>

                    {featured.description && (
                      <p className="mt-3.5 max-w-2xl line-clamp-2 text-[13px] leading-6 text-white/55 md:text-[14px]">
                        {featured.description}
                      </p>
                    )}
                  </div>
                </Link>

                <aside className="rounded-[20px] border border-white/[0.065] bg-[#0d0d0d] p-5">
                  <div className="flex items-center justify-between border-b border-white/[0.065] pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-white">
                        Ultime notizie
                      </p>
                      <p className="mt-1 text-[10px] text-white/28">Aggiornamenti recenti</p>
                    </div>

                    <Link
                      to="/articles"
                      className="text-[9px] font-black tracking-[.04em] text-red-500 transition hover:text-red-400"
                    >
                      VEDI TUTTE
                    </Link>
                  </div>

                  <div className="pt-1">
                    {sideNews.map((article) => (
                      <ArticleCard key={article.id} article={article} horizontal />
                    ))}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="h-[430px] animate-pulse rounded-[20px] bg-white/5" />
            )}
          </div>
        </section>

        {categories.length > 0 && (
          <div className="border-b border-white/[0.06] bg-[#0a0a0a]">
            <div className="fd-container flex items-center gap-2 overflow-x-auto py-3.5 whitespace-nowrap fd-hide-scrollbar">
              <span className="mr-2 text-[9px] font-black uppercase tracking-[.17em] text-white/25">
                Sezioni
              </span>

              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${slugify(category)}`}
                  className="rounded-full border border-white/[0.075] bg-white/[0.02] px-3.5 py-2 text-[10px] font-black uppercase tracking-[.08em] text-white/58 transition hover:border-red-500/45 hover:bg-red-500/[0.08] hover:text-red-400"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        )}

        {leadGrid.length > 0 && (
          <section className="fd-container py-12 md:py-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-7 bg-red-600" />
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                    In evidenza
                  </p>
                </div>

                <h2 className="mt-2.5 text-[30px] font-black tracking-[-.04em] md:text-[36px]">
                  Da non perdere
                </h2>
              </div>

              <Link
                to="/articles"
                className="hidden items-center gap-2 text-[12px] font-bold text-white/40 transition hover:text-red-400 sm:flex"
              >
                Vai all&apos;archivio <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
              <ArticleCard article={leadGrid[0]} />

              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
                {leadGrid.slice(1, 5).map((article) => (
                  <ArticleCard key={article.id} article={article} compact />
                ))}
              </div>
            </div>
          </section>
        )}

        {moreNews.length > 0 && (
          <section className="border-t border-white/[0.06] bg-[#090909]">
            <div className="fd-container py-12 md:py-16">
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <span className="h-px w-7 bg-red-600" />
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                    Ultimi aggiornamenti
                  </p>
                </div>

                <h2 className="mt-2.5 text-[30px] font-black tracking-[-.04em] md:text-[36px]">
                  Altre notizie
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {moreNews.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </section>
        )}

        {podcasts.length > 0 && (
          <section className="border-y border-white/[0.06] bg-[#0c0c0c]">
            <div className="fd-container py-12 md:py-16">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5 text-red-500">
                    <Headphones size={15} />
                    <span className="text-[10px] font-black uppercase tracking-[.2em]">
                      Podcast
                    </span>
                  </div>

                  <h2 className="mt-2.5 text-[30px] font-black tracking-[-.04em] md:text-[36px]">
                    FattiDiretti da ascoltare
                  </h2>
                </div>

                <Link
                  to="/podcasts"
                  className="text-[12px] font-bold text-white/40 transition hover:text-red-400"
                >
                  Tutti i podcast →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {podcasts.slice(0, 4).map((podcast) => (
                  <Link
                    key={podcast.id}
                    to={`/podcast/${podcast.slug || podcast.id}`}
                    className="group overflow-hidden rounded-[18px] border border-white/[0.06] bg-[#101010] transition duration-300 hover:-translate-y-1 hover:border-red-500/25 hover:bg-[#121212]"
                  >
                    <div className="aspect-video overflow-hidden bg-white/5">
                      {podcast.coverImage ? (
                        <img
                          src={podcast.coverImage}
                          alt={podcast.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center font-black text-white/10">
                          PODCAST
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-[9px] font-black uppercase tracking-[.18em] text-red-500">
                        {podcast.category || "Podcast"}
                      </p>

                      <h3 className="mt-2 line-clamp-3 text-[19px] font-black leading-[1.08] tracking-[-.02em] transition group-hover:text-red-400">
                        {podcast.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  )
}
