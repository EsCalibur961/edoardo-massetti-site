import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function CategoryPage() {
  const { category } = useParams()
  const [articles, setArticles] = useState([])

  const categoryName = category.replaceAll("-", " ")

  useEffect(() => {
    async function loadArticles() {
      const data = await getDocs(collection(db, "articles"))

      const filtered = data.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter(
          (article) =>
            article.category?.toLowerCase().trim() ===
            categoryName.toLowerCase().trim()
        )

      setArticles(filtered)
    }

    loadArticles()
  }, [categoryName])

  return (
    <>
      <Helmet>
        <title>{categoryName} | FattiDiretti</title>
        <meta
          name="description"
          content={`Articoli della categoria ${categoryName} su FattiDiretti.`}
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Categoria
            </p>

            <h1 className="text-6xl md:text-8xl font-black mt-4 capitalize">
              {categoryName}
            </h1>

            <p className="text-white/50 text-xl mt-6">
              Tutti gli articoli pubblicati in questa categoria.
            </p>
          </div>
        </section>

        <section className="px-6 py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            {articles.length === 0 ? (
              <p className="text-black/50 text-xl">
                Nessun articolo trovato in questa categoria.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
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