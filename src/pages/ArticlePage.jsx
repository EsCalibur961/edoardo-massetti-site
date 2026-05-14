import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Helmet } from "react-helmet-async"
import { db, auth } from "../firebase"

import Navbar from "../components/Navbar"

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    async function loadArticle() {
      const data = await getDocs(collection(db, "articles"))
      const found = data.docs.find((item) => item.data().slug === slug)

      if (found) {
        setArticle({
          id: found.id,
          ...found.data(),
        })
      }
    }

    loadArticle()

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [slug])

  useEffect(() => {
    async function loadComments() {
      if (!article?.id) return

      const commentsRef = collection(db, "articles", article.id, "comments")
      const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"))
      const data = await getDocs(commentsQuery)

      setComments(
        data.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      )
    }

    loadComments()
  }, [article])

  async function publishComment() {
    if (!user) return
    if (!commentText.trim()) return

    await addDoc(collection(db, "articles", article.id, "comments"), {
      text: commentText,
      email: user.email,
      createdAt: serverTimestamp(),
    })

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
              className="text-xl leading-relaxed text-white/80 mb-20"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="border-t border-white/10 pt-12">
              <h2 className="text-4xl font-black mb-8">Commenti</h2>

              {!user ? (
                <p className="text-white/50 mb-8">
                  Accedi o registrati per commentare.
                </p>
              ) : (
                <div className="mb-10">
                  <textarea
                    rows="4"
                    placeholder="Scrivi un commento..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-5 rounded-2xl bg-white/10 border border-white/10 outline-none resize-none"
                  />

                  <button
                    onClick={publishComment}
                    className="mt-4 px-8 py-4 rounded-full bg-white text-black font-black"
                  >
                    Pubblica commento
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <p className="text-white/40 text-sm mb-2">
                      {comment.email}
                    </p>

                    <p className="text-white/80">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}