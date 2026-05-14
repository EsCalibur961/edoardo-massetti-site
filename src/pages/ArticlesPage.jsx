import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    async function loadArticles() {
      const data = await getDocs(collection(db, "articles"))
      setArticles(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }

    loadArticles()
  }, [])

  return (
    <>
      <Helmet>
        <title>Tutti gli articoli | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Archivio
            </p>

            <h1 className="text-6xl md:text-8xl font-black mt-4">
              Tutti gli articoli
            </h1>
          </div>
        </section>

        <section className="px-6 py-24 bg-white text-black">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}