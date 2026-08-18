import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Helmet } from "react-helmet-async"
import { ArrowUp, Copy, MessageCircle, Share2 } from "lucide-react"
import { db, auth } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ArticleCard from "../components/ArticleCard"

export default function ArticlePage() {
  const { slug } = useParams()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [relatedArticles, setRelatedArticles] = useState([])
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await getDocs(collection(db, "articles"))
        const items = data.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))

        const found = items.find(
          (item) => item.slug === slug || item.id === slug
        )

        setArticle(found || null)

        if (found) {
          setRelatedArticles(
            items
              .filter(
                (item) =>
                  item.id !== found.id &&
                  item.category === found.category
              )
              .slice(0, 3)
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadArticle()

    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [slug])

  useEffect(() => {
    async function loadComments() {
      if (!article?.id) return

      const data = await getDocs(
        query(
          collection(db, "articles", article.id, "comments"),
          orderBy("createdAt", "desc")
        )
      )

      setComments(
        data.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      )
    }

    loadComments()
  }, [article])

  useEffect(() => {
    function updateReadProgress() {
      const scrollTop = window.scrollY
      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight

      setReadProgress(
        pageHeight > 0
          ? Math.min(100, (scrollTop / pageHeight) * 100)
          : 0
      )
    }

    updateReadProgress()
    window.addEventListener("scroll", updateReadProgress, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateReadProgress)
    }
  }, [])

  async function getUserDisplayName() {
    if (!user) return "Utente"

    const userSnap = await getDoc(doc(db, "users", user.uid))

    if (userSnap.exists()) {
      const userData = userSnap.data()

      return (
        userData.displayName ||
        userData.username ||
        "Utente FattiDiretti"
      )
    }

    return user.displayName || "Utente FattiDiretti"
  }

  async function publishComment() {
    if (!user || !commentText.trim() || !article?.id) return

    const displayName = await getUserDisplayName()

    await addDoc(
      collection(db, "articles", article.id, "comments"),
      {
        text: commentText.trim(),
        userId: user.uid,
        displayName,
        createdAt: serverTimestamp(),
      }
    )

    setCommentText("")

    const data = await getDocs(
      query(
        collection(db, "articles", article.id, "comments"),
        orderBy("createdAt", "desc")
      )
    )

    setComments(
      data.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )
  }

  function shareOnWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    alert("Link copiato!")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="fd-container py-14 md:py-20">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-3 w-28 bg-white/10" />
            <div className="mt-6 h-16 max-w-4xl bg-white/10" />
            <div className="mt-4 h-16 max-w-3xl bg-white/10" />
            <div className="mt-10 aspect-video rounded-2xl bg-white/10" />
          </div>
        </section>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="fd-container py-24">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
            Errore 404
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-[-.045em]">
            Articolo non trovato.
          </h1>

          <Link
            to="/articles"
            className="mt-8 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-500"
          >
            Torna agli articoli
          </Link>
        </section>

        <Footer />
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>{article.seoTitle || article.title}</title>
        <meta
          name="description"
          content={
            article.seoDescription ||
            article.description ||
            ""
          }
        />
      </Helmet>

      <div
        className="fixed left-0 top-0 z-[9999] h-[3px] bg-red-600"
        style={{ width: `${readProgress}%` }}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
        <Navbar />

        <article>
          <header className="border-b border-white/[0.06] bg-[#0a0a0a]">
            <div className="fd-container py-9 sm:py-12 md:py-18">
              <div className="mx-auto max-w-5xl">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                    {article.category || "News"}
                  </span>
                </div>

                <h1 className="mt-5 max-w-[1000px] text-[36px] font-black leading-[.99] tracking-[-.045em] sm:text-[50px] md:text-[68px] lg:text-[78px]">
                  {article.title}
                </h1>

                {article.description && (
                  <p className="mt-6 max-w-3xl text-[17px] leading-8 text-white/48 md:text-[19px]">
                    {article.description}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.07] pt-5 text-[10px] font-bold uppercase tracking-[.14em] text-white/30">
                  <span>{article.publishDate || "FattiDiretti"}</span>
                  <span>FattiDiretti</span>
                  <span className="flex items-center gap-2">
                    <MessageCircle size={13} />
                    {comments.length} commenti
                  </span>
                </div>
              </div>
            </div>
          </header>

          {article.coverImage && (
            <div className="fd-container py-5 sm:py-7 md:py-10">
              <div className="mx-auto max-w-6xl overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101010]">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="max-h-[720px] w-full object-cover"
                />
              </div>
            </div>
          )}

          <section className="fd-container pb-12 md:pb-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[150px_minmax(0,760px)] lg:justify-center">
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <p className="mb-3 text-[9px] font-black uppercase tracking-[.18em] text-white/25">
                  Condividi
                </p>

                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-[11px] font-bold text-white/60 transition hover:border-red-500/35 hover:bg-red-500/[0.08] hover:text-red-400"
                  >
                    <Share2 size={14} />
                    WhatsApp
                  </button>

                  <button
                    onClick={copyLink}
                    className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-[11px] font-bold text-white/60 transition hover:border-red-500/35 hover:bg-red-500/[0.08] hover:text-red-400"
                  >
                    <Copy size={14} />
                    Copia
                  </button>
                </div>
              </aside>

              <div className="min-w-0">
                <div
                  className="fd-prose fd-prose-dark max-w-full overflow-hidden break-words"
                  dangerouslySetInnerHTML={{
                    __html: article.content || "",
                  }}
                />

                {relatedArticles.length > 0 && (
                  <section className="mt-16 border-t border-white/[0.07] pt-10">
                    <div className="flex items-center gap-3">
                      <span className="h-px w-7 bg-red-600" />
                      <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                        Continua a leggere
                      </p>
                    </div>

                    <h2 className="mt-2.5 text-[30px] font-black tracking-[-.04em]">
                      Potrebbe interessarti
                    </h2>

                    <div className="mt-7 grid gap-6 md:grid-cols-3">
                      {relatedArticles.map((item) => (
                        <ArticleCard
                          key={item.id}
                          article={item}
                          compact
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section className="mt-16 border-t border-white/[0.07] pt-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-px w-7 bg-red-600" />
                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                          Community
                        </p>
                      </div>

                      <h2 className="mt-2.5 text-[30px] font-black tracking-[-.04em]">
                        Commenti
                      </h2>
                    </div>

                    <span className="text-[12px] text-white/25">
                      {comments.length}
                    </span>
                  </div>

                  {!user ? (
                    <div className="mt-7 rounded-[18px] border border-white/[0.07] bg-[#101010] p-6">
                      <p className="text-sm text-white/42">
                        Accedi o registrati per partecipare alla conversazione.
                      </p>

                      <Link
                        to="/login"
                        className="mt-4 inline-flex rounded-full bg-red-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-red-500"
                      >
                        Accedi
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-7">
                      <textarea
                        rows="4"
                        placeholder="Scrivi un commento..."
                        value={commentText}
                        onChange={(event) =>
                          setCommentText(event.target.value)
                        }
                        className="w-full resize-none rounded-[16px] border border-white/[0.08] bg-[#101010] p-5 text-white outline-none placeholder:text-white/20 focus:border-red-500/40"
                      />

                      <button
                        onClick={publishComment}
                        className="mt-3 rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-500"
                      >
                        Pubblica commento
                      </button>
                    </div>
                  )}

                  <div className="mt-8 divide-y divide-white/[0.07] border-t border-white/[0.07]">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="py-6"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[.12em] text-white/28">
                          {comment.displayName ||
                            "Utente FattiDiretti"}
                        </p>

                        <p className="mt-2 leading-7 text-white/62">
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </article>

        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          aria-label="Torna su"
          className="fixed bottom-4 right-4 z-40 grid h-10 w-10 place-items-center rounded-full bg-red-600 text-white shadow-xl transition hover:bg-red-500 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
        >
          <ArrowUp size={18} />
        </button>

        <Footer />
      </main>
    </>
  )
}
