import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
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

  useEffect(() => {
    async function loadData() {
      const articlesData = await getDocs(collection(db, "articles"))
      const podcastsData = await getDocs(collection(db, "podcasts"))

      const loadedArticles = articlesData.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0
          const dateB = b.createdAt?.seconds || 0
          return dateB - dateA
        })

      setArticles(loadedArticles)

      setPodcasts(
        podcastsData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
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
  const secondaryArticles = articles.slice(1, 4)

  return (
    <>
      <Helmet>
        <title>FattiDiretti | Giornalismo moderno e diretto</title>
        <meta
          name="description"
          content="FattiDiretti è un magazine moderno di articoli, reportage, podcast e storie raccontate senza filtri."
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-32 md:pt-36 px-4 md:px-6 pb-16 md:pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] md:tracking-[0.45em] text-white/40 text-xs md:text-sm mb-8">
              Giornalismo • Podcast • Reportage
            </p>

            <h1 className="text-6xl md:text-9xl font-black leading-[0.85] mb-8">
              FATTI
              <span className="block text-white/35">DIRETTI</span>
            </h1>

            <p className="text-lg md:text-2xl text-white/60 max-w-3xl leading-relaxed">
              Storie, inchieste, video podcast e contenuti editoriali raccontati
              con uno stile moderno, aggressivo e senza giri di parole.
            </p>
          </div>
        </section>

        <section className="px-4 md:px-6 py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-xs md:text-sm">
              Ultimo pubblicato
            </p>

            <h2 className="text-4xl md:text-7xl font-black mt-4 mb-10">
              In evidenza
            </h2>

            {featuredArticle ? (
              <Link
                to={`/article/${featuredArticle.slug}`}
                className="grid lg:grid-cols-2 gap-10 items-center group"
              >
                <div className="rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10">
                  {featuredArticle.coverImage ? (
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-[320px] sm:h-[460px] md:h-[620px] object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="h-[320px] md:h-[520px] flex items-center justify-center text-white/20 text-6xl font-black">
                      FATTI
                    </div>
                  )}
                </div>

                <div>
                  <p className="uppercase tracking-[0.3em] text-white/40 text-xs md:text-sm mb-6">
                    {featuredArticle.category}
                  </p>

                  <h3 className="text-4xl md:text-7xl font-black leading-[0.95] mb-8">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-8">
                    {featuredArticle.description}
                  </p>

                  <span className="inline-block px-7 py-4 rounded-full bg-white text-black font-black">
                    Leggi ora
                  </span>
                </div>
              </Link>
            ) : (
              <p className="text-white/50 text-xl">
                Nessun articolo pubblicato.
              </p>
            )}
          </div>
        </section>

        {secondaryArticles.length > 0 && (
          <section className="px-4 md:px-6 py-16 md:py-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <p className="uppercase tracking-[0.35em] text-white/40 text-xs md:text-sm">
                Altri articoli
              </p>

              <h2 className="text-4xl md:text-7xl font-black mt-4 mb-14">
                In evidenza
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {secondaryArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-5">
                      {article.category}
                    </p>

                    <h3 className="text-3xl font-black mb-5">
                      {article.title}
                    </h3>

                    <p className="text-white/50">{article.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 md:px-6 py-20 md:py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="uppercase tracking-[0.35em] text-black/40 text-xs md:text-sm">
                  Tutti gli articoli
                </p>

                <h2 className="text-4xl md:text-7xl font-black mt-4">
                  Ultime pubblicazioni
                </h2>
              </div>

              <Link
                to="/articles"
                className="px-7 py-4 rounded-full bg-black text-white font-black text-center"
              >
                Vedi tutti
              </Link>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {articles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-6 py-20 md:py-28 bg-[#080808] text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="uppercase tracking-[0.35em] text-white/40 text-xs md:text-sm">
                  Video Podcast
                </p>

                <h2 className="text-4xl md:text-7xl font-black mt-4">
                  Podcast FattiDiretti
                </h2>
              </div>

              <Link
                to="/podcasts"
                className="px-7 py-4 rounded-full bg-white text-black font-black text-center"
              >
                Vedi tutti
              </Link>
            </div>

            {podcasts.length === 0 ? (
              <p className="text-white/50 text-xl">
                Nessun podcast pubblicato.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {podcasts.slice(0, 6).map((podcast) => (
                  <Link
                    key={podcast.id}
                    to={`/podcast/${podcast.slug}`}
                    className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    {podcast.coverImage && (
                      <img
                        src={podcast.coverImage}
                        alt={podcast.title}
                        className="w-full aspect-video object-cover"
                      />
                    )}

                    <div className="p-7">
                      <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                        {podcast.category}
                      </p>

                      <h3 className="text-3xl font-black mb-5">
                        {podcast.title}
                      </h3>

                      <p className="text-white/50">{podcast.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}