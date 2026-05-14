import { useEffect, useMemo, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"
import PodcastCard from "../components/PodcastCard"
import RegisterBox from "../components/RegisterBox"

export default function Home() {
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tutte")

  useEffect(() => {
    async function loadData() {
      const articlesData = await getDocs(collection(db, "articles"))
      const podcastsData = await getDocs(collection(db, "podcasts"))

      setArticles(
        articlesData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )

      setPodcasts(
        podcastsData.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    }

    loadData()
  }, [])

  const categories = useMemo(() => {
    const list = articles.map((article) => article.category).filter(Boolean)
    return ["Tutte", ...new Set(list)]
  }, [articles])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title?.toLowerCase().includes(search.toLowerCase()) ||
        article.description?.toLowerCase().includes(search.toLowerCase()) ||
        article.category?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === "Tutte" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [articles, search, selectedCategory])

  const featuredArticle = filteredArticles[0]
  const secondaryArticles = filteredArticles.slice(1, 4)

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

        <section className="pt-36 px-6 pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.45em] text-white/40 text-sm mb-8">
              Giornalismo • Podcast • Reportage
            </p>

            <h1 className="text-7xl md:text-9xl font-black leading-[0.85] mb-8">
              FATTI
              <span className="block text-white/35">DIRETTI</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl leading-relaxed">
              Storie, inchieste e contenuti editoriali raccontati con uno stile
              moderno, aggressivo e senza giri di parole.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Cerca articoli..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/10 outline-none text-white"
            />

            <div className="flex gap-3 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-4 rounded-full font-bold whitespace-nowrap transition ${
                    selectedCategory === category
                      ? "bg-white text-black"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Primo piano
            </p>

            <h2 className="text-5xl md:text-7xl font-black mt-4 mb-10">
              La storia principale
            </h2>

            {featuredArticle ? (
              <Link
                to={`/article/${featuredArticle.slug}`}
                className="grid lg:grid-cols-2 gap-10 items-center group"
              >
                <div className="rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10">
                  {featuredArticle.coverImage ? (
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-[520px] object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="h-[520px] flex items-center justify-center text-white/20 text-6xl font-black">
                      FATTI
                    </div>
                  )}
                </div>

                <div>
                  <p className="uppercase tracking-[0.3em] text-white/40 text-sm mb-6">
                    {featuredArticle.category}
                  </p>

                  <h3 className="text-5xl md:text-7xl font-black leading-[0.95] mb-8 group-hover:text-white/70 transition">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-xl text-white/60 leading-relaxed mb-8">
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
          <section className="px-6 py-20 border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
                Trending
              </p>

              <h2 className="text-5xl md:text-7xl font-black mt-4 mb-14">
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

                    <p className="text-white/50">
                      {article.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="articles" className="px-6 py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="uppercase tracking-[0.35em] text-black/40 text-sm">
                  Tutti gli articoli
                </p>

                <h2 className="text-5xl md:text-7xl font-black mt-4">
                  Ultime pubblicazioni
                </h2>
              </div>

              <p className="text-black/50 max-w-xl text-lg">
                Una selezione aggiornata di reportage, opinioni, cronaca,
                cultura e contenuti editoriali firmati FattiDiretti.
              </p>
            </div>

            {filteredArticles.length === 0 ? (
              <p className="text-black/50 text-xl">
                Nessun articolo trovato.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="podcast" className="px-6 py-24 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Video Podcast
            </p>

            <h2 className="text-5xl md:text-7xl font-black mt-4 mb-14">
              Podcast e approfondimenti
            </h2>

            {podcasts.length === 0 ? (
              <p className="text-white/50 text-xl">
                Nessun podcast pubblicato.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {podcasts.map((podcast) => (
                  <PodcastCard key={podcast.id} podcast={podcast} />
                ))}
              </div>
            )}
          </div>
        </section>

        <RegisterBox />

        <Footer />
      </main>
    </>
  )
}
