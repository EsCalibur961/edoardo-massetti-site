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
import { Headphones, MessageCircle, Play } from "lucide-react"
import { db, auth } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function isDirectVideo(url = "") {
  return /\.(mp4|mov|webm)(\?.*)?$/i.test(url)
}

export default function PodcastPage() {
  const { slug } = useParams()

  const [podcast, setPodcast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    async function loadPodcast() {
      try {
        const data = await getDocs(collection(db, "podcasts"))

        const found = data.docs.find(
          (item) =>
            item.data().slug === slug ||
            item.id === slug
        )

        if (found) {
          setPodcast({
            id: found.id,
            ...found.data(),
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadPodcast()

    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [slug])

  useEffect(() => {
    async function loadComments() {
      if (!podcast?.id) return

      const data = await getDocs(
        query(
          collection(db, "podcasts", podcast.id, "comments"),
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
  }, [podcast])

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
    if (!user || !commentText.trim() || !podcast?.id) return

    const displayName = await getUserDisplayName()

    await addDoc(
      collection(db, "podcasts", podcast.id, "comments"),
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
        collection(db, "podcasts", podcast.id, "comments"),
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
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />
        <section className="fd-container py-14 md:py-20">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-3 w-32 bg-white/[0.06]" />
            <div className="mt-6 h-16 max-w-4xl bg-white/[0.06]" />
            <div className="mt-9 aspect-video rounded-[20px] bg-white/[0.06]" />
          </div>
        </section>
      </main>
    )
  }

  if (!podcast) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="fd-container py-24">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
            FattiDiretti Audio
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-[-.045em]">
            Podcast non trovato.
          </h1>

          <Link
            to="/podcasts"
            className="mt-7 inline-flex rounded-full bg-red-600 px-5 py-3 text-xs font-black text-white"
          >
            Torna ai podcast
          </Link>
        </section>

        <Footer />
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>{podcast.seoTitle || podcast.title}</title>
        <meta
          name="description"
          content={
            podcast.seoDescription ||
            podcast.description ||
            ""
          }
        />
      </Helmet>

      <main className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
        <Navbar />

        <header className="border-b border-white/[0.06] bg-[#0a0a0a]">
          <div className="fd-container py-12 md:py-18">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-red-600" />
                <div className="flex items-center gap-2 text-red-500">
                  <Headphones size={15} />
                  <span className="text-[10px] font-black uppercase tracking-[.22em]">
                    {podcast.category || "FattiDiretti Audio"}
                  </span>
                </div>
              </div>

              <h1 className="mt-5 max-w-[980px] text-[42px] font-black leading-[.97] tracking-[-.05em] sm:text-[54px] md:text-[68px]">
                {podcast.title}
              </h1>

              {podcast.description && (
                <p className="mt-6 max-w-3xl text-[17px] leading-8 text-white/45">
                  {podcast.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.07] pt-5 text-[10px] font-bold uppercase tracking-[.13em] text-white/28">
                <span>{podcast.publishDate || "FattiDiretti"}</span>
                <span>FattiDiretti Audio</span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={13} />
                  {comments.length} commenti
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="fd-container py-8 md:py-12">
          <div className="mx-auto max-w-5xl">
            {podcast.videoUrl ? (
              <div className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-black shadow-2xl">
                {isDirectVideo(podcast.videoUrl) ? (
                  <video
                    src={podcast.videoUrl}
                    controls
                    playsInline
                    poster={podcast.coverImage || undefined}
                    className="aspect-video w-full bg-black object-contain"
                  />
                ) : (
                  <iframe
                    src={podcast.videoUrl}
                    title={podcast.title}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            ) : podcast.coverImage ? (
              <div className="relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#101010]">
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="aspect-video w-full object-cover opacity-75"
                />

                <div className="absolute inset-0 grid place-items-center bg-black/15">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-xl">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid aspect-video place-items-center rounded-[20px] border border-white/[0.07] bg-[#101010]">
                <div className="text-center">
                  <Headphones
                    size={28}
                    className="mx-auto text-red-500"
                  />
                  <p className="mt-3 text-xs font-black uppercase tracking-[.16em] text-white/25">
                    FattiDiretti Audio
                  </p>
                </div>
              </div>
            )}

            {podcast.content && (
              <div
                className="fd-prose fd-prose-dark mx-auto mt-10 max-w-[760px] overflow-hidden break-words"
                dangerouslySetInnerHTML={{
                  __html: podcast.content,
                }}
              />
            )}

            <section className="mx-auto mt-14 max-w-[760px] border-t border-white/[0.07] pt-9">
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

                <span className="text-xs text-white/25">
                  {comments.length}
                </span>
              </div>

              {!user ? (
                <div className="mt-7 rounded-[18px] border border-white/[0.07] bg-[#101010] p-6">
                  <p className="text-sm text-white/40">
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
                      {comment.displayName || "Utente FattiDiretti"}
                    </p>

                    <p className="mt-2 leading-7 text-white/62">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
