import { useEffect, useMemo, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, "articles")),
      getDocs(collection(db, "podcasts")),
    ]).then(([articlesData, podcastsData]) => {
      setArticles(articlesData.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setPodcasts(podcastsData.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
  }, [])

  const normalizedQuery = queryText.toLowerCase().trim()

  const matches = (item) => {
    if (!normalizedQuery) return true

    return [item.title, item.category, item.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  }

  const filteredArticles = useMemo(
    () => articles.filter(matches),
    [articles, normalizedQuery]
  )

  const filteredPodcasts = useMemo(
    () => podcasts.filter(matches),
    [podcasts, normalizedQuery]
  )

  return (
    <>
      <Helmet>
        <title>Ricerca | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-12 md:py-18">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Trova un contenuto
              </p>
            </div>

            <h1 className="mt-4 max-w-5xl text-[42px] font-black leading-[.98] tracking-[-.05em] sm:text-[54px] md:text-[68px]">
              Cosa stai cercando?
            </h1>

            <div className="mt-8 flex max-w-3xl items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 py-4 transition focus-within:border-red-500/45 focus-within:bg-white/[0.05]">
              <Search size={21} className="shrink-0 text-red-500" />
              <input
                autoFocus
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Titolo, argomento, categoria..."
                className="w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/25"
              />
            </div>
          </div>
        </section>

        <section className="fd-container py-12 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                Risultati
              </p>
              <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                Articoli
                <span className="ml-3 text-white/25">{filteredArticles.length}</span>
              </h2>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 text-white/45">
              Nessun articolo corrisponde alla ricerca.
            </div>
          )}

          {filteredPodcasts.length > 0 && (
            <section className="mt-16 border-t border-white/[0.07] pt-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                Audio
              </p>

              <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                Podcast
                <span className="ml-3 text-white/25">{filteredPodcasts.length}</span>
              </h2>

              <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredPodcasts.map((podcast) => (
                  <Link
                    key={podcast.id}
                    to={`/podcast/${podcast.slug || podcast.id}`}
                    className="group rounded-[18px] border border-white/[0.07] bg-[#101010] p-5 transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:bg-[#121212]"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[.2em] text-red-500">
                      Podcast
                    </p>

                    <h3 className="mt-2 text-[20px] font-black leading-[1.1] tracking-[-.025em] transition group-hover:text-red-400">
                      {podcast.title}
                    </h3>

                    {podcast.description && (
                      <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-white/40">
                        {podcast.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>

        <Footer />
      </main>
    </>
  )
}
