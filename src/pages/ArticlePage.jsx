import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
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

import { db, auth } from "../firebase"
import Navbar from "../components/Navbar"

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    async function loadArticle() {
      const data = await getDocs(collection(db, "articles"))
      const found = data.docs.find((item) => {
  const articleData = item.data();

  return (
    articleData.slug === slug ||
    item.id === slug
  );
});

if (found) {
  setArticle({
    id: found.id,
    ...found.data(),
  });
} else {
  console.log("ARTICOLO NON TROVATO");
}
console.log(slug)
console.log(found)
      setLoading(false);
    }

    loadArticle()

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [slug])

    const currentUrl = window.location.href;

const shareOnWhatsApp = () => {
  window.open(`https://wa.me/?text=${encodeURIComponent(currentUrl)}`, "_blank");
};

const copyLink = async () => {
  await navigator.clipboard.writeText(currentUrl);
  alert("Link copiato!");
};

useEffect(() => {
  function updateReadProgress() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight

    if (docHeight <= 0) return

    const progress = (scrollTop / docHeight) * 100
    setReadProgress(progress)
  }

  updateReadProgress()
  window.addEventListener("scroll", updateReadProgress)

  return () => window.removeEventListener("scroll", updateReadProgress)
}, [])

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

    await addDoc(collection(db, "articles", article.id, "comments"), {
      text: commentText,
      userId: user.uid,
      displayName,
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
  if (loading) {
  if (loading) {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-28 px-4 md:px-6 pb-24">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded mb-6"></div>
          <div className="h-14 w-3/4 bg-white/10 rounded mb-6"></div>
          <div className="h-[360px] w-full bg-white/10 rounded-3xl mb-10"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-white/10 rounded"></div>
            <div className="h-4 w-5/6 bg-white/10 rounded"></div>
            <div className="h-4 w-4/6 bg-white/10 rounded"></div>
          </div>
        </div>
      </section>
    </main>
  )
}
}

if (!article) {
  return <p>Articolo non trovato</p>;
}

  return (
    <>
    <div
 className="fixed top-0 left-0 h-2 bg-red-500 z-[9999] transition-all"
  style={{ width: `${readProgress}%` }}
></div>
<button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full shadow-lg transition"
>
  ↑
</button>
      <Helmet>
        <title>{article.seoTitle || article.title}</title>
        <meta
          name="description"
          content={article.seoDescription || article.description}
        />
      </Helmet>

      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <section className="pt-28 md:pt-40 px-4 md:px-6 pb-24">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            <p className="uppercase tracking-[0.25em] text-white/40 text-xs md:text-sm mb-5">
              {article.category}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.95] mb-8">
              {article.title}
            </h1>

            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-[220px] sm:h-[420px] md:h-[680px] object-cover rounded-[2rem] mb-10"
              />
           )}

            <p className="text-white/40 mb-10 text-sm">
              {article.publishDate}
            </p>
            <div className="flex flex-wrap gap-3 my-6">
  <button
    onClick={shareOnWhatsApp}
    className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold"
  >
    Condividi su WhatsApp
  </button>

  <button
    onClick={copyLink}
    className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/10"
  >
    Copia link
  </button>
</div>

            <div
              className="text-[15px] sm:text-base md:text-xl leading-7 md:leading-[1.9]
              text-white/80 mb-20 max-w-none
              break-words"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            {relatedArticles.length > 0 && (
  <section className="mt-16">
    <h2 className="text-2xl font-bold text-white mb-6">
      Potrebbe interessarti
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {relatedArticles.map((item) => (
        <a
          key={item.id}
          href={`/articolo/${item.slug}`}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition"
        >
          {item.coverImage && (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-40 object-cover"
            />
          )}

          <div className="p-4">
            <h3 className="text-white font-bold text-lg">
              {item.title}
            </h3>
          </div>
        </a>
      ))}
    </div>
  </section>
)}

            <div className="border-t border-white/10 pt-12">
              <h2 className="text-3xl md:text-4xl font-black mb-8">
                Commenti
              </h2>

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
                      {comment.displayName || "Utente FattiDiretti"}
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