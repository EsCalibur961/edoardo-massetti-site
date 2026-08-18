import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
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

export default function CategoryPage() {
  const { category } = useParams()
  const [articles, setArticles] = useState([])

  const categoryName = useMemo(
    () => decodeURIComponent(category || "").replaceAll("-", " "),
    [category]
  )

  useEffect(() => {
    getDocs(collection(db, "articles")).then((data) => {
      const filtered = data.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter(
          (article) =>
            article.category?.toLowerCase().trim() ===
            categoryName.toLowerCase().trim()
        )
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))

      setArticles(filtered)
    })
  }, [categoryName])

  return (
    <>
      <Helmet>
        <title>{categoryName} | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-12 md:py-18">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Categoria
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <h1 className="max-w-4xl text-[48px] font-black capitalize leading-none tracking-[-.055em] sm:text-[62px] md:text-[76px]">
                {categoryName}
              </h1>

              <p className="text-[13px] font-semibold text-white/30">
                {articles.length} {articles.length === 1 ? "articolo" : "articoli"}
              </p>
            </div>
          </div>
        </section>

        <section className="fd-container py-12 md:py-16">
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8">
              <p className="text-[18px] font-bold">Nessun articolo trovato.</p>
              <p className="mt-2 text-sm text-white/35">
                Non ci sono ancora contenuti pubblicati in questa categoria.
              </p>
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  )
}
