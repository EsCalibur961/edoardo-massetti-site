import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])

  useEffect(() => {
    async function loadArticle() {
      const data = await getDocs(collection(db, "articles"))

      const articles = data.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))

      const found = articles.find((item) => item.slug === slug)

      if (found) {
        setArticle(found)

        setRelated(
          articles
            .filter(
              (item) =>
                item.id !== found.id &&
                item.category === found.category
            )
            .slice(0, 3)
        )
      }
    }

    loadArticle()
  }, [slug])

  if (!article) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Articolo non trovato...
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>{article.seoTitle || article.title}</title>
        <meta
          name="description"
          content={article.seoDescription || article.description}
        />
        <meta property="og:title" content={article.seoTitle || article.title} />
        <meta property="og:description" content={article.seoDescription || article.description} />
        {article.coverImage && <meta property="og:image" content={article.coverImage} />}
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-28">
          <div className="max-w-5xl mx-auto">
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full rounded-[2rem] mb-10"
              />
            )}

            <p className="uppercase tracking-[0.25em] text-white/40 text-sm mb-6">
              {article.category}
            </p>

            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight">
              {article.title}
            </h1>

            <p className="text-white/40 mb-10">
              {article.publishDate}
            </p>

            <div
              className="text-xl leading-relaxed text-white/80"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />
          </div>
        </section>

        {related.length > 0 && (
          <section className="px-6 py-24 bg-white text-black">
            <div className="max-w-7xl mx-auto">
              <p className="uppercase tracking-[0.35em] text-black/40 text-sm">
                Correlati
              </p>

              <h2 className="text-5xl md:text-7xl font-black mt-4 mb-14">
                Articoli correlati
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {related.map((item) => (
                  <ArticleCard key={item.id} article={item} />
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
