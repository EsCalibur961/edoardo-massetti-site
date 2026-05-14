import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])

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

  const cleanQuery = query.toLowerCase().trim()

  const filteredArticles = articles.filter((article) => {
    return (
      article.title?.toLowerCase().includes(cleanQuery) ||
      article.category?.toLowerCase().includes(cleanQuery) ||
      article.description?.toLowerCase().includes(cleanQuery)
    )
  })

  const filteredPodcasts = podcasts.filter((podcast) => {
    return (
      podcast.title?.toLowerCase().includes(cleanQuery) ||
      podcast.category?.toLowerCase().includes(cleanQuery) ||
      podcast.description?.toLowerCase().includes(cleanQuery)
    )
  })

  return (
    <>
      <Helmet>
        <title>Ricerca | FattiDiretti</title>
        <meta
          name="description"
          content="Cerca articoli, podcast, reportage e contenuti su FattiDiretti."
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Cerca contenuti
            </p>

            <h1 className="text-6xl md:text-8xl font-black mt-4 mb-10">
              Ricerca
            </h1>

            <input
              type="text"
              placeholder="Cerca articoli, podcast, categorie..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-3xl px-6 py-5 rounded-2xl bg-white text-black text-lg outline-none"
            />
          </div>
        </section>

        <section className="px-6 py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-10">
              Articoli
            </h2>

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

        <section className="px-6 py-24 bg-[#080808] text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-black mb-10">
              Podcast
            </h2>

            {filteredPodcasts.length === 0 ? (
              <p className="text-white/50 text-xl">
                Nessun podcast trovato.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredPodcasts.map((podcast) => (
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

                      <p className="text-white/50">
                        {podcast.description}
                      </p>
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