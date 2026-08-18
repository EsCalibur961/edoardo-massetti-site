import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

function stamp(item) {
  if (item.publishDate) {
    const p = item.publishDate.split("/")
    if (p.length === 3) return new Date(+p[2], +p[1] - 1, +p[0]).getTime()
  }
  return item.createdAt?.seconds * 1000 || 0
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    getDocs(collection(db, "articles")).then((data) => {
      setArticles(data.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => stamp(b) - stamp(a)))
    })
  }, [])

  return (
    <>
      <Helmet><title>Articoli | FattiDiretti</title></Helmet>
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />
        <section className="border-b border-white/10">
          <div className="fd-container py-12 md:py-16">
            <p className="text-[11px] font-black uppercase tracking-[.2em] text-red-500">Archivio</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h1 className="text-4xl font-black tracking-[-.045em] md:text-6xl">Tutti gli articoli</h1>
              <p className="max-w-md text-sm leading-6 text-white/45">Cronaca, società, cultura, attualità e approfondimenti dalla redazione FattiDiretti.</p>
            </div>
          </div>
        </section>
        <section className="fd-container py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
