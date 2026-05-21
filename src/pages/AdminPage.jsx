import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

import { db, auth, storage } from "../firebase"
import Navbar from "../components/Navbar"

export default function AdminPage() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [stats, setStats] = useState({ views: 0 })
  const [registrationsCount, setRegistrationsCount] = useState(0)

  const [editingArticleId, setEditingArticleId] = useState(null)
  const [editingPodcastId, setEditingPodcastId] = useState(null)

  const [articleCoverFile, setArticleCoverFile] = useState(null)
  const [podcastCoverFile, setPodcastCoverFile] = useState(null)
  const [podcastVideoFile, setPodcastVideoFile] = useState(null)

  const [message, setMessage] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showAdminPasswords, setShowAdminPasswords] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  })

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
    createdAt: null,
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
    createdAt: null,
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  async function uploadFile(file, folder) {
    if (!file) return ""

    const safeName = file.name.replaceAll(" ", "-")
    const fileRef = ref(
      storage,
      `${folder}/${Date.now()}-${safeName}`
    )

    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  }

  async function loadDashboard() {
    const articlesData = await getDocs(collection(db, "articles"))
    const podcastsData = await getDocs(collection(db, "podcasts"))
    const registrationsData = await getDocs(collection(db, "registrations"))
    const statsSnap = await getDoc(doc(db, "stats", "main"))

    setArticles(
      articlesData.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || a.updatedAt?.seconds || 0
          const bTime = b.createdAt?.seconds || b.updatedAt?.seconds || 0
          return bTime - aTime
        })
    )

    setPodcasts(
      podcastsData.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || a.updatedAt?.seconds || 0
          const bTime = b.createdAt?.seconds || b.updatedAt?.seconds || 0
          return bTime - aTime
        })
    )

    setRegistrationsCount(registrationsData.size)

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

  async function changeAdminPassword() {
    try {
      setMessage("")

      if (!user) {
        setMessage("Devi essere loggato come admin.")
        return
      }

      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setMessage("Inserisci password attuale e nuova password.")
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage("La nuova password deve avere almeno 6 caratteri.")
        return
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      )

      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwordForm.newPassword)

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      })

      setMessage("Password admin aggiornata correttamente.")
    } catch {
      setMessage("Errore: password attuale non corretta o sessione scaduta.")
    }
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

    try {
      setMessage("Salvataggio articolo in corso...")

      const uploadedCoverUrl = articleCoverFile
        ? await uploadFile(articleCoverFile, "articles/covers")
        : articleForm.coverImage

      const articleData = {
        slug: createSlug(articleForm.title),
        ...articleForm,
        coverImage: uploadedCoverUrl,
        createdAt: editingArticleId
          ? articleForm.createdAt || serverTimestamp()
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
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
        createdAt: null,
      })

      setArticleCoverFile(null)
      loadDashboard()
    } catch (error) {
      setMessage("Errore articolo: " + error.message)
    }
  }

  async function savePodcast() {
    if (!isAdmin) return

    if (
      !podcastForm.title ||
      !podcastForm.category ||
      !podcastForm.description
    ) {
      setMessage("Compila titolo, categoria e descrizione podcast.")
      return
    }

    try {
      setMessage("Salvataggio podcast in corso...")

      const uploadedCoverUrl = podcastCoverFile
        ? await uploadFile(podcastCoverFile, "podcasts/covers")
        : podcastForm.coverImage

      const uploadedVideoUrl = podcastVideoFile
        ? await uploadFile(podcastVideoFile, "podcasts/videos")
        : podcastForm.videoUrl

      if (!uploadedVideoUrl) {
        setMessage("Carica un video podcast oppure inserisci un URL video.")
        return
      }

      const podcastData = {
        slug: createSlug(podcastForm.title),
        ...podcastForm,
        coverImage: uploadedCoverUrl,
        videoUrl: uploadedVideoUrl,
        createdAt: editingPodcastId
          ? podcastForm.createdAt || serverTimestamp()
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
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
        createdAt: null,
      })

      setPodcastCoverFile(null)
      setPodcastVideoFile(null)
      loadDashboard()
    } catch (error) {
      setMessage("Errore podcast: " + error.message)
    }
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
      createdAt: article.createdAt || null,
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
      createdAt: podcast.createdAt || null,
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

      <section className="pt-32 md:pt-40 px-4 md:px-6 pb-28">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-xs md:text-sm">
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
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password admin"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <label className="flex items-center gap-2 text-black/60 text-sm">
                  <input
                    type="checkbox"
                    checked={showLoginPassword}
                    onChange={() => setShowLoginPassword(!showLoginPassword)}
                  />
                  Mostra password
                </label>

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

                <div className="p-6 rounded-[2rem] bg-white text-black">
                  <p className="text-black/50 font-bold">Registrazioni</p>
                  <h3 className="text-4xl font-black mt-2">
                    {registrationsCount}
                  </h3>
                </div>
              </div>

              <button
                onClick={logoutAdmin}
                className="mb-10 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10"
              >
                Logout
              </button>

              <div className="mb-12 p-8 rounded-[2rem] bg-white text-black">
                <h2 className="text-3xl font-black mb-6">
                  Cambia password admin
                </h2>

                <div className="space-y-4">
                  <input
                    type={showAdminPasswords ? "text" : "password"}
                    placeholder="Password attuale"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <input
                    type={showAdminPasswords ? "text" : "password"}
                    placeholder="Nuova password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <label className="flex items-center gap-2 text-black/60 text-sm">
                    <input
                      type="checkbox"
                      checked={showAdminPasswords}
                      onChange={() =>
                        setShowAdminPasswords(!showAdminPasswords)
                      }
                    />
                    Mostra password
                  </label>

                  <button
                    onClick={changeAdminPassword}
                    className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                  >
                    Aggiorna password
                  </button>
                </div>
              </div>

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

                    <div className="border border-black/10 rounded-2xl p-5 bg-black/5">
  <p className="font-black mb-2">
    Copertina articolo
  </p>

  <p className="text-sm text-black/50 mb-4">
    Seleziona un'immagine JPG, PNG o WEBP dal dispositivo.
  </p>

  <input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={(e) => setArticleCoverFile(e.target.files[0])}
    className="w-full"
  />
</div>

                    {articleForm.coverImage && (
                      <img
                        src={articleForm.coverImage}
                        alt="Copertina articolo"
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    )}

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

                    <div className="border border-black/10 rounded-2xl p-5 bg-black/5">
  <p className="font-black mb-2">
    Copertina podcast
  </p>

  <p className="text-sm text-black/50 mb-4">
    Seleziona un'immagine JPG, PNG o WEBP dal dispositivo.
  </p>

  <input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={(e) => setPodcastCoverFile(e.target.files[0])}
    className="w-full"
  />
</div>

                    <div className="border border-black/10 rounded-2xl p-5 bg-black/5">
  <p className="font-black mb-2">
    Video podcast
  </p>

  <p className="text-sm text-black/50 mb-4">
    Seleziona un video MP4 o MOV dal dispositivo.
  </p>

  <input
    type="file"
    accept="video/mp4,video/quicktime"
    onChange={(e) => setPodcastVideoFile(e.target.files[0])}
    className="w-full"
  />
</div>

                    {podcastForm.coverImage && (
                      <img
                        src={podcastForm.coverImage}
                        alt="Copertina podcast"
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    )}

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
                      {editingPodcastId ? "Salva podcast" : "Pubblica podcast"}
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
            </>
          )}
        </div>
      </section>
    </main>
  )
}