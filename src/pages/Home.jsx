import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"

import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function Home() {
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [breakingNews, setBreakingNews] = useState({
    active: false,
    text: "",
    link: "",
  })

  function getTimestamp(item) {
    if (item.publishDate) {
      const parts = item.publishDate.split("/")

      if (parts.length === 3) {
        const day = Number(parts[0])
        const month = Number(parts[1]) - 1
        const year = Number(parts[2])

        return new Date(year, month, day).getTime()
      }
    }

    return item.createdAt?.seconds * 1000 || 0
  }

  useEffect(() => {
    async function loadData() {
      const articlesData = await getDocs(collection(db, "articles"))
      const podcastsData = await getDocs(collection(db, "podcasts"))
      const breakingSnap = await getDoc(
        doc(db, "settings", "breakingNews")
      )

      const loadedArticles = articlesData.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))

      const loadedPodcasts = podcastsData.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))

      setArticles(loadedArticles)
      setPodcasts(loadedPodcasts)

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

  const featuredArticle = articles[0]
  const latestArticles = articles.slice(1, 7)
  const latestPodcasts = podcasts.slice(0, 4)

  return (
    <>
      <Helmet>
        <title>FattiDiretti | Giornalismo moderno</title>

        <meta
          name="description"
          content="Magazine moderno di giornalismo, podcast e reportage."
        />
      </Helmet>

      <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
        <Navbar />

        {breakingNews.active && breakingNews.text && (
          <section className="pt-24 md:pt-28 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <Link
                to={breakingNews.link || "/"}
                className="block overflow-hidden rounded-full bg-red-600 px-6 py-4 font-black text-sm md:text-base animate-pulse"
              >
                🚨 BREAKING NEWS — {breakingNews.text}
              </Link>
            </div>
          </section>
        )}

        <section className="pt-16 md:pt-24 px-4 md:px-6 pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="uppercase tracking-[0.45em] text-white/40 text-xs md:text-sm mb-6">
                  Giornalismo moderno
                </p>

                <h1 className="text-6xl md:text-9xl font-black leading-[0.85]">
                  FATTI
                  <span className="block text-white/25">
                    DIRETTI
                  </span>
                </h1>

                <p className="text-lg md:text-2xl text-white/55 leading-relaxed mt-10 max-w-2xl">
                  Articoli, reportage, podcast e storie raccontate
                  con uno stile moderno, aggressivo e diretto.
                </p>

                <div className="flex flex-wrap gap-4 mt-10">
                  <Link
                    to="/articles"
                    className="px-8 py-4 rounded-full bg-white text-black font-black"
                  >
                    Leggi articoli
                  </Link>

                  <Link
                    to="/podcasts"
                    className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition"
                  >
                    Guarda podcast
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-[120px]" />

                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5">
                  {featuredArticle?.coverImage ? (
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-[350px] md:h-[650px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[350px] md:h-[650px] flex items-center justify-center text-7xl font-black text-white/10">
                      NEWS
                    </div>
                  )}

                  {featuredArticle && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 md:p-12 flex flex-col justify-end">
                      <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">
                        {featuredArticle.category}
                      </p>

                      <h2 className="text-3xl md:text-6xl font-black leading-[0.95] mb-6">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-white/70 text-base md:text-xl max-w-2xl mb-8">
                        {featuredArticle.description}
                      </p>

                      <Link
                        to={`/article/${featuredArticle.slug}`}
                        className="w-fit px-8 py-4 rounded-full bg-white text-black font-black"
                      >
                        Leggi ora
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-20 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="uppercase tracking-[0.35em] text-black/40 text-xs md:text-sm">
                  Ultime notizie
                </p>

                <h2 className="text-5xl md:text-7xl font-black mt-4">
                  In evidenza
                </h2>
              </div>

              <Link
                to="/articles"
                className="px-7 py-4 rounded-full bg-black text-white font-black"
              >
                Tutti gli articoli
              </Link>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-24 bg-[#080808] border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="uppercase tracking-[0.35em] text-white/40 text-xs md:text-sm">
                  Video Podcast
                </p>

                <h2 className="text-5xl md:text-7xl font-black mt-4">
                  Podcast premium
                </h2>
              </div>

              <Link
                to="/podcasts"
                className="px-7 py-4 rounded-full bg-white text-black font-black"
              >
                Tutti i podcast
              </Link>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
              {latestPodcasts.map((podcast) => (
                <Link
                  key={podcast.id}
                  to={`/podcast/${podcast.slug}`}
                  className="group rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="overflow-hidden">
                    {podcast.coverImage ? (
                      <img
                        src={podcast.coverImage}
                        alt={podcast.title}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center text-5xl font-black text-white/10">
                        PODCAST
                      </div>
                    )}
                  </div>

                  <div className="p-7">
                    <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                      {podcast.category}
                    </p>

                    <h3 className="text-2xl font-black mb-4 leading-tight">
                      {podcast.title}
                    </h3>

                    <p className="text-white/50 line-clamp-3">
                      {podcast.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-24 bg-black border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-[3rem] bg-gradient-to-br from-red-600 to-black p-10 md:p-16 border border-white/10">
              <p className="uppercase tracking-[0.35em] text-white/60 text-xs md:text-sm mb-6">
                FattiDiretti
              </p>

              <h2 className="text-4xl md:text-7xl font-black leading-[0.95] max-w-4xl">
                Informazione moderna.
                <span className="block text-white/60">
                  Senza filtri.
                </span>
              </h2>

              <p className="text-lg md:text-2xl text-white/70 mt-8 max-w-3xl">
                Un magazine digitale creato per raccontare storie,
                eventi e attualità con un impatto visivo premium.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  to="/articles"
                  className="px-8 py-4 rounded-full bg-white text-black font-black"
                >
                  Esplora articoli
                </Link>

                <Link
                  to="/search"
                  className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition"
                >
                  Cerca contenuti
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}