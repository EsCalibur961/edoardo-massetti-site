import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"

import Navbar from "../components/Navbar"

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)

  useEffect(() => {
    async function loadArticle() {
      const data = await getDocs(collection(db, "articles"))

      const found = data.docs.find(
        (item) => item.data().slug === slug
      )

      if (found) {
        setArticle(found.data())
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

            <h1 className="text-6xl md:text-8xl font-black mb-8">
              {article.title}
            </h1>

            <p className="text-white/40 mb-10">{article.publishDate}</p>

            <div
              className="text-xl leading-relaxed text-white/80"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </section>
      </main>
    </>
  )
}