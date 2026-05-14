import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function Home() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    async function loadArticles() {
      const data = await getDocs(collection(db, "articles"))

      setArticles(
        data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      )
    }

    loadArticles()
  }, [])

  return (
    <>
      <Helmet>
        <title>FattiDiretti</title>

        <meta
          name="description"
          content="Magazine editoriale moderno italiano"
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="min-h-screen flex items-center px-6 pt-32">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.45em] text-white/40 text-sm mb-8">
              Giornalismo • Podcast • Reportage
            </p>

            <h1 className="text-7xl md:text-9xl font-black leading-[0.9] mb-8">
              FATTI
              <span className="block text-white/35">
                DIRETTI
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl">
              Informazione moderna, aggressiva e diretta.
            </p>
          </div>
        </section>

        <section className="px-6 py-28 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl font-black mb-14">
              Ultimi Articoli
            </h2>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}