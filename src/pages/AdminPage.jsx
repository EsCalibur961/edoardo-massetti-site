import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

import { db, auth } from "../firebase"
import Navbar from "../components/Navbar"

export default function AdminPage() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({ views: 0 })
  const [editingArticleId, setEditingArticleId] = useState(null)
  const [editingPodcastId, setEditingPodcastId] = useState(null)
  const [message, setMessage] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [articleForm, setArticleForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    coverImage: "",
    publishDate: "",
    seoTitle: "",
    seoDescription: "",
  })

  const [podcastForm, setPodcastForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    coverImage: "",
    videoUrl: "",
    publishDate: "",
    seoTitle: "",
    seoDescription: "",
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  async function loadDashboard() {
    const articlesData = await getDocs(collection(db, "articles"))
    const podcastsData = await getDocs(collection(db, "podcasts"))
    const registrationsData = await getDocs(collection(db, "registrations"))
    const statsSnap = await getDoc(doc(db, "stats", "main"))

    setArticles(
      articlesData.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )

    setPodcasts(
      podcastsData.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )

    setRegistrations(
      registrationsData.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )

    if (statsSnap.exists()) {
      setStats(statsSnap.data())
    }
  }

  useEffect(() => {
    loadDashboard()

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  async function loginAdmin() {
    try {
      setMessage("")

      await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      )

      setLoginForm({
        email: "",
        password: "",
      })

      setMessage("Accesso admin effettuato.")
    } catch {
      setMessage("Email o password non corretti.")
    }
  }

  async function logoutAdmin() {
    await signOut(auth)
    setMessage("Logout effettuato.")
  }

  async function saveArticle() {
    if (!isAdmin) return

    if (
      !articleForm.title ||
      !articleForm.category ||
      !articleForm.description
    ) {
      setMessage("Compila titolo, categoria e descrizione articolo.")
      return
    }

    const articleData = {
      slug: createSlug(articleForm.title),
      ...articleForm,
      publishDate:
        articleForm.publishDate || new Date().toLocaleDateString("it-IT"),
      seoTitle: articleForm.seoTitle || articleForm.title,
      seoDescription: articleForm.seoDescription || articleForm.description,
    }

    if (editingArticleId) {
      await updateDoc(doc(db, "articles", editingArticleId), articleData)
      setEditingArticleId(null)
      setMessage("Articolo modificato.")
    } else {
      await addDoc(collection(db, "articles"), articleData)
      setMessage("Articolo pubblicato.")
    }

    setArticleForm({
      title: "",
      category: "",
      description: "",
      content: "",
      coverImage: "",
      publishDate: "",
      seoTitle: "",
      seoDescription: "",
    })

    loadDashboard()
  }

  async function savePodcast() {
    if (!isAdmin) return

    if (
      !podcastForm.title ||
      !podcastForm.category ||
      !podcastForm.description ||
      !podcastForm.videoUrl
    ) {
      setMessage("Compila titolo, categoria, descrizione e URL video podcast.")
      return
    }

    const podcastData = {
      slug: createSlug(podcastForm.title),
      ...podcastForm,
      publishDate:
        podcastForm.publishDate || new Date().toLocaleDateString("it-IT"),
      seoTitle: podcastForm.seoTitle || podcastForm.title,
      seoDescription: podcastForm.seoDescription || podcastForm.description,
    }

    if (editingPodcastId) {
      await updateDoc(doc(db, "podcasts", editingPodcastId), podcastData)
      setEditingPodcastId(null)
      setMessage("Podcast modificato.")
    } else {
      await addDoc(collection(db, "podcasts"), podcastData)
      setMessage("Podcast pubblicato.")
    }

    setPodcastForm({
      title: "",
      category: "",
      description: "",
      content: "",
      coverImage: "",
      videoUrl: "",
      publishDate: "",
      seoTitle: "",
      seoDescription: "",
    })

    loadDashboard()
  }

  function editArticle(article) {
    setEditingArticleId(article.id)
    setArticleForm({
      title: article.title || "",
      category: article.category || "",
      description: article.description || "",
      content: article.content || "",
      coverImage: article.coverImage || "",
      publishDate: article.publishDate || "",
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
    })
  }

  function editPodcast(podcast) {
    setEditingPodcastId(podcast.id)
    setPodcastForm({
      title: podcast.title || "",
      category: podcast.category || "",
      description: podcast.description || "",
      content: podcast.content || "",
      coverImage: podcast.coverImage || "",
      videoUrl: podcast.videoUrl || "",
      publishDate: podcast.publishDate || "",
      seoTitle: podcast.seoTitle || "",
      seoDescription: podcast.seoDescription || "",
    })
  }

  async function deleteArticle(id) {
    await deleteDoc(doc(db, "articles", id))
    setMessage("Articolo eliminato.")
    loadDashboard()
  }

  async function deletePodcast(id) {
    await deleteDoc(doc(db, "podcasts", id))
    setMessage("Podcast eliminato.")
    loadDashboard()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6 pb-28">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
            Area riservata
          </p>

          <h1 className="text-5xl md:text-7xl font-black mt-4 mb-10">
            Admin FattiDiretti
          </h1>

          {message && <p className="mb-8 text-white/70 font-bold">{message}</p>}

          {!isAdmin ? (
            <div className="max-w-xl p-8 rounded-[2rem] bg-white text-black">
              <h2 className="text-3xl font-black mb-6">Login admin</h2>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email admin"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <input
                  type="password"
                  placeholder="Password admin"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <button
                  onClick={loginAdmin}
                  className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                >
                  Accedi
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="p-6 rounded-[2rem] bg-white text-black">
                  <p className="text-black/50 font-bold">Visualizzazioni</p>
                  <h3 className="text-4xl font-black mt-2">
                    {stats.views || 0}
                  </h3>
                </div>

                <div className="p-6 rounded-[2rem] bg-white text-black">
                  <p className="text-black/50 font-bold">Registrazioni</p>
                  <h3 className="text-4xl font-black mt-2">
                    {registrations.length}
                  </h3>
                </div>

                <div className="p-6 rounded-[2rem] bg-white text-black">
                  <p className="text-black/50 font-bold">Articoli</p>
                  <h3 className="text-4xl font-black mt-2">
                    {articles.length}
                  </h3>
                </div>

                <div className="p-6 rounded-[2rem] bg-white text-black">
                  <p className="text-black/50 font-bold">Podcast</p>
                  <h3 className="text-4xl font-black mt-2">
                    {podcasts.length}
                  </h3>
                </div>
              </div>

              <button
                onClick={logoutAdmin}
                className="mb-10 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10"
              >
                Logout
              </button>

              <div className="grid lg:grid-cols-2 gap-8 mb-20">
                <div className="p-8 rounded-[2rem] bg-white text-black">
                  <h2 className="text-3xl font-black mb-6">
                    {editingArticleId ? "Modifica articolo" : "Nuovo articolo"}
                  </h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titolo articolo"
                      value={articleForm.title}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Categoria"
                      value={articleForm.category}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="URL immagine copertina"
                      value={articleForm.coverImage}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          coverImage: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="3"
                      placeholder="Descrizione breve"
                      value={articleForm.description}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <ReactQuill
                      theme="snow"
                      value={articleForm.content}
                      onChange={(value) =>
                        setArticleForm({
                          ...articleForm,
                          content: value,
                        })
                      }
                    />

                    <input
                      type="text"
                      placeholder="SEO title"
                      value={articleForm.seoTitle}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          seoTitle: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="3"
                      placeholder="SEO description"
                      value={articleForm.seoDescription}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          seoDescription: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <button
                      onClick={saveArticle}
                      className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                    >
                      {editingArticleId
                        ? "Salva articolo"
                        : "Pubblica articolo"}
                    </button>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-white text-black">
                  <h2 className="text-3xl font-black mb-6">
                    {editingPodcastId ? "Modifica podcast" : "Nuovo podcast"}
                  </h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titolo podcast"
                      value={podcastForm.title}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Categoria podcast"
                      value={podcastForm.category}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="URL immagine copertina"
                      value={podcastForm.coverImage}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          coverImage: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="URL video embed YouTube"
                      value={podcastForm.videoUrl}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          videoUrl: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="3"
                      placeholder="Descrizione breve"
                      value={podcastForm.description}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <ReactQuill
                      theme="snow"
                      value={podcastForm.content}
                      onChange={(value) =>
                        setPodcastForm({
                          ...podcastForm,
                          content: value,
                        })
                      }
                    />

                    <button
                      onClick={savePodcast}
                      className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                    >
                      {editingPodcastId
                        ? "Salva podcast"
                        : "Pubblica podcast"}
                    </button>
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-black mb-6">Contenuti pubblicati</h2>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black">Articoli</h3>

                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                    >
                      <h4 className="text-2xl font-black">{article.title}</h4>
                      <p className="text-white/40">{article.category}</p>
                      <p className="text-white/30 text-sm">
                        /article/{article.slug}
                      </p>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => editArticle(article)}
                          className="px-5 py-3 rounded-full bg-white text-black font-bold"
                        >
                          Modifica
                        </button>

                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="px-5 py-3 rounded-full border border-red-400/40 text-red-300 font-bold"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black">Podcast</h3>

                  {podcasts.map((podcast) => (
                    <div
                      key={podcast.id}
                      className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                    >
                      <h4 className="text-2xl font-black">{podcast.title}</h4>
                      <p className="text-white/40">{podcast.category}</p>
                      <p className="text-white/30 text-sm">
                        /podcast/{podcast.slug}
                      </p>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => editPodcast(podcast)}
                          className="px-5 py-3 rounded-full bg-white text-black font-bold"
                        >
                          Modifica
                        </button>

                        <button
                          onClick={() => deletePodcast(podcast.id)}
                          className="px-5 py-3 rounded-full border border-red-400/40 text-red-300 font-bold"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-4xl font-black mt-20 mb-6">
                Utenti registrati
              </h2>

              <div className="space-y-3">
                {registrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60"
                  >
                    {item.email}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}