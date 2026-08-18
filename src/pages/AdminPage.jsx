import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import {
  BarChart3,
  FileText,
  Mic2,
  Users,
  Radio,
  LockKeyhole,
  LogOut,
  Upload,
  Pencil,
  Trash2,
  Save,
  Plus,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { db, auth, storage } from "../firebase"
import Navbar from "../components/Navbar"

export default function AdminPage() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [articles, setArticles] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [stats, setStats] = useState({ views: 0 })
  const [registrationsCount, setRegistrationsCount] = useState(0)

  const [breakingNews, setBreakingNews] = useState({
    active: false,
    text: "",
    link: "",
  })

  const [editingArticleId, setEditingArticleId] = useState(null)
  const [editingPodcastId, setEditingPodcastId] = useState(null)

  const [articleCoverFile, setArticleCoverFile] = useState(null)
  const [podcastCoverFile, setPodcastCoverFile] = useState(null)
  const [podcastVideoFile, setPodcastVideoFile] = useState(null)

  const [message, setMessage] = useState("")
  const [archiveTab, setArchiveTab] = useState("articles")
  const [archiveSearch, setArchiveSearch] = useState("")
  const [archiveCategory, setArchiveCategory] = useState("all")
  const [archivePage, setArchivePage] = useState(1)
  const archivePerPage = 15

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

  const isAdmin = user?.email === ADMIN_EMAIL || adminProfile?.role === "admin"

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
    const fileRef = ref(storage, `${folder}/${Date.now()}-${safeName}`)

    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  }

  async function loadDashboard() {
    try {
      const articlesData = await getDocs(collection(db, "articles"))
      const podcastsData = await getDocs(collection(db, "podcasts"))
      const registrationsData = await getDocs(collection(db, "registrations"))
      const statsSnap = await getDoc(doc(db, "stats", "main"))
      const breakingSnap = await getDoc(doc(db, "settings", "breakingNews"))

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

      if (breakingSnap.exists()) {
        setBreakingNews(breakingSnap.data())
      }
    } catch (error) {
      console.error("Errore caricamento dashboard:", error)
      setMessage("Errore caricamento dashboard: controlla le regole Firestore.")
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setAdminProfile(null)

      if (currentUser) {
        try {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid))
          if (userSnap.exists()) {
            setAdminProfile(userSnap.data())
          }
        } catch (error) {
          console.error("Errore controllo ruolo admin:", error)
        }
      }

      setAuthChecked(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadDashboard()
    }
  }, [isAdmin])

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

  async function saveBreakingNews() {
    if (!isAdmin) return

    await setDoc(doc(db, "settings", "breakingNews"), {
      ...breakingNews,
      updatedAt: serverTimestamp(),
    })

    setMessage("Breaking News aggiornata.")
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

  const notificationResponse = await fetch("/api/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Nuovo articolo su FattiDiretti",
      body: articleForm.title,
      link: `/article/${articleData.slug}`,
    }),
  })

  const notificationResult = await notificationResponse.json()

  console.log("RISPOSTA NOTIFICA:", notificationResult)

  setMessage(
    `Articolo pubblicato. Notifiche inviate: ${
      notificationResult.sent || 0
    }, fallite: ${notificationResult.failed || 0}`
  )
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

  const archiveSource = archiveTab === "articles" ? articles : podcasts

  const archiveCategories = [
    ...new Set(
      archiveSource
        .map((item) => item.category)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    ),
  ]

  const archiveItems = archiveSource.filter((item) => {
    const search = archiveSearch.trim().toLowerCase()
    const matchesSearch =
      !search ||
      [item.title, item.category, item.description, item.slug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))

    const matchesCategory =
      archiveCategory === "all" || item.category === archiveCategory

    return matchesSearch && matchesCategory
  })

  const archiveTotalPages = Math.max(
    1,
    Math.ceil(archiveItems.length / archivePerPage)
  )

  const archiveSafePage = Math.min(archivePage, archiveTotalPages)

  const archiveVisibleItems = archiveItems.slice(
    (archiveSafePage - 1) * archivePerPage,
    archiveSafePage * archivePerPage
  )

  const fieldClass =
    "w-full rounded-[14px] border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-[14px] text-white outline-none transition placeholder:text-white/38 focus:border-red-500/45 focus:bg-white/[0.05]"

  const panelClass =
    "rounded-[22px] border border-white/[0.07] bg-[#101010] shadow-[0_18px_55px_rgba(0,0,0,.16)]"

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="fd-container py-7 sm:py-9 md:py-14">
        <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:mb-9 sm:gap-5 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-red-500">
                Area riservata
              </p>
            </div>

            <h1 className="mt-3 text-[38px] font-black leading-[.96] tracking-[-.05em] sm:mt-4 sm:text-[54px] md:text-[70px]">
              Admin <span className="text-red-500">FattiDiretti</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/38">
              Gestisci pubblicazioni, podcast, breaking news e impostazioni della piattaforma.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={logoutAdmin}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 text-xs font-bold text-white/60 transition hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-400"
            >
              <LogOut size={15} />
              Logout
            </button>
          )}
        </div>

        {message && (
          <div className="mb-7 rounded-[16px] border border-red-500/20 bg-red-500/[0.08] px-5 py-4 text-sm font-semibold text-red-200">
            {message}
          </div>
        )}

        {!authChecked ? (
          <div className="h-40 animate-pulse rounded-[22px] bg-white/[0.035]" />
        ) : !isAdmin ? (
          <div className={`${panelClass} max-w-xl p-6 md:p-8`}>
            <div className="mb-7">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                Accesso
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.035em]">
                Login amministratore
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/35">
                Inserisci le credenziali dell’account autorizzato.
              </p>
            </div>

            <div className="space-y-3.5">
              <input
                type="email"
                placeholder="Email admin"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                className={fieldClass}
              />

              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password admin"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className={fieldClass}
              />

              <label className="flex items-center gap-2.5 py-1 text-xs text-white/38">
                <input
                  type="checkbox"
                  checked={showLoginPassword}
                  onChange={() => setShowLoginPassword(!showLoginPassword)}
                  className="accent-red-600"
                />
                Mostra password
              </label>

              <button
                onClick={loginAdmin}
                className="mt-2 w-full rounded-[14px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
              >
                Accedi all’area admin
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Visualizzazioni",
                  value: stats.views || 0,
                  icon: BarChart3,
                  note: "Totale sito",
                },
                {
                  label: "Articoli",
                  value: articles.length,
                  icon: FileText,
                  note: "Pubblicati",
                },
                {
                  label: "Podcast",
                  value: podcasts.length,
                  icon: Mic2,
                  note: "Episodi",
                },
                {
                  label: "Registrazioni",
                  value: registrationsCount,
                  icon: Users,
                  note: "Utenti",
                },
              ].map(({ label, value, icon: Icon, note }) => (
                <div key={label} className={`${panelClass} p-4 sm:p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-white/38">{label}</p>
                      <p className="mt-2 text-[36px] font-black leading-none tracking-[-.045em]">
                        {value}
                      </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/[0.09] text-red-500">
                      <Icon size={18} />
                    </div>
                  </div>

                  <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] font-semibold uppercase tracking-[.12em] text-white/20">
                    {note}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 xl:grid-cols-[1.35fr_.65fr]">
              <div className={`${panelClass} overflow-hidden`}>
                <div className="flex flex-col gap-4 border-b border-white/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-white">
                      <Radio size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-[-.025em]">
                        Breaking News
                      </h2>
                      <p className="mt-1 text-xs text-white/30">
                        Banner urgente mostrato in homepage.
                      </p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3">
                    <span className="text-xs font-bold text-white/45">
                      {breakingNews.active ? "Attiva" : "Disattivata"}
                    </span>
                    <input
                      type="checkbox"
                      checked={breakingNews.active}
                      onChange={() =>
                        setBreakingNews({
                          ...breakingNews,
                          active: !breakingNews.active,
                        })
                      }
                      className="h-4 w-4 accent-red-600"
                    />
                  </label>
                </div>

                <div className="space-y-3.5 p-4 sm:p-6">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/28">
                      Testo
                    </label>
                    <input
                      type="text"
                      placeholder="Testo Breaking News"
                      value={breakingNews.text}
                      onChange={(e) =>
                        setBreakingNews({
                          ...breakingNews,
                          text: e.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[.14em] text-white/28">
                      Collegamento
                    </label>
                    <input
                      type="text"
                      placeholder="Link opzionale, esempio: /article/titolo"
                      value={breakingNews.link}
                      onChange={(e) =>
                        setBreakingNews({
                          ...breakingNews,
                          link: e.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </div>

                  <button
                    onClick={saveBreakingNews}
                    className="inline-flex items-center gap-2 rounded-[13px] bg-red-600 px-5 py-3 text-xs font-black text-white transition hover:bg-red-500"
                  >
                    <Save size={15} />
                    Salva Breaking News
                  </button>
                </div>
              </div>

              <div className={`${panelClass} p-4 sm:p-6`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-white/60">
                    <LockKeyhole size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-[-.025em]">
                      Sicurezza
                    </h2>
                    <p className="mt-1 text-xs text-white/30">
                      Password account admin
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
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
                    className={fieldClass}
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
                    className={fieldClass}
                  />

                  <label className="flex items-center gap-2 text-xs text-white/35">
                    <input
                      type="checkbox"
                      checked={showAdminPasswords}
                      onChange={() =>
                        setShowAdminPasswords(!showAdminPasswords)
                      }
                      className="accent-red-600"
                    />
                    Mostra password
                  </label>

                  <button
                    onClick={changeAdminPassword}
                    className="mt-1 w-full rounded-[13px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs font-black text-white/70 transition hover:border-red-500/30 hover:text-red-400"
                  >
                    Aggiorna password
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-8 sm:mt-10">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                    Pubblicazione
                  </p>
                  <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                    Crea nuovi contenuti
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className={`${panelClass} p-5 md:p-6`}>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-red-500">
                        Articoli
                      </p>
                      <h3 className="mt-1.5 text-2xl font-black tracking-[-.03em]">
                        {editingArticleId ? "Modifica articolo" : "Nuovo articolo"}
                      </h3>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/[0.09] text-red-500">
                      {editingArticleId ? <Pencil size={17} /> : <Plus size={18} />}
                    </div>
                  </div>

                  <div className="space-y-3.5">
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
                      className={fieldClass}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
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
                        className={fieldClass}
                      />

                      <input
                        type="text"
                        placeholder="Data pubblicazione"
                        value={articleForm.publishDate}
                        onChange={(e) =>
                          setArticleForm({
                            ...articleForm,
                            publishDate: e.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <label className="block cursor-pointer rounded-[16px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5 transition hover:border-red-500/35 hover:bg-red-500/[0.035]">
                      <div className="flex items-start gap-3">
                        <Upload size={18} className="mt-0.5 text-red-500" />
                        <div>
                          <p className="text-sm font-black">Copertina articolo</p>
                          <p className="mt-1 text-xs leading-5 text-white/30">
                            JPG, PNG o WEBP dal dispositivo.
                          </p>
                          <p className="mt-3 text-xs font-semibold text-white/55">
                            {articleCoverFile?.name || "Scegli file"}
                          </p>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          setArticleCoverFile(e.target.files[0])
                        }
                        className="hidden"
                      />
                    </label>

                    {articleForm.coverImage && (
                      <img
                        src={articleForm.coverImage}
                        alt="Copertina articolo"
                        className="h-44 w-full rounded-[16px] object-cover"
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
                      className={`${fieldClass} resize-none`}
                    />

                    <div className="admin-editor h-[250px] overflow-hidden rounded-[16px] border border-white/[0.08] bg-white [&_.quill]:h-full [&_.ql-container]:h-[205px] [&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto">
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
                    </div>

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
                      className={fieldClass}
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
                      className={`${fieldClass} resize-none`}
                    />

                    <button
                      onClick={saveArticle}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
                    >
                      <Save size={16} />
                      {editingArticleId
                        ? "Salva modifiche"
                        : "Pubblica articolo"}
                    </button>
                  </div>
                </div>

                <div className={`${panelClass} p-5 md:p-6`}>
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-red-500">
                        Podcast
                      </p>
                      <h3 className="mt-1.5 text-2xl font-black tracking-[-.03em]">
                        {editingPodcastId ? "Modifica podcast" : "Nuovo podcast"}
                      </h3>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/[0.09] text-red-500">
                      {editingPodcastId ? <Pencil size={17} /> : <Plus size={18} />}
                    </div>
                  </div>

                  <div className="space-y-3.5">
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
                      className={fieldClass}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
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
                        className={fieldClass}
                      />

                      <input
                        type="text"
                        placeholder="Data pubblicazione"
                        value={podcastForm.publishDate}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            publishDate: e.target.value,
                          })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block cursor-pointer rounded-[16px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5 transition hover:border-red-500/35">
                        <Upload size={18} className="text-red-500" />
                        <p className="mt-3 text-sm font-black">Copertina podcast</p>
                        <p className="mt-1 text-xs text-white/30">JPG, PNG o WEBP</p>
                        <p className="mt-3 truncate text-xs font-semibold text-white/55">
                          {podcastCoverFile?.name || "Scegli file"}
                        </p>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) =>
                            setPodcastCoverFile(e.target.files[0])
                          }
                          className="hidden"
                        />
                      </label>

                      <label className="block cursor-pointer rounded-[16px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5 transition hover:border-red-500/35">
                        <Upload size={18} className="text-red-500" />
                        <p className="mt-3 text-sm font-black">Video podcast</p>
                        <p className="mt-1 text-xs text-white/30">MP4 o MOV</p>
                        <p className="mt-3 truncate text-xs font-semibold text-white/55">
                          {podcastVideoFile?.name || "Scegli file"}
                        </p>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime"
                          onChange={(e) =>
                            setPodcastVideoFile(e.target.files[0])
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    {podcastForm.coverImage && (
                      <img
                        src={podcastForm.coverImage}
                        alt="Copertina podcast"
                        className="h-44 w-full rounded-[16px] object-cover"
                      />
                    )}

                    <input
                      type="text"
                      placeholder="URL video (opzionale se carichi un file)"
                      value={podcastForm.videoUrl}
                      onChange={(e) =>
                        setPodcastForm({
                          ...podcastForm,
                          videoUrl: e.target.value,
                        })
                      }
                      className={fieldClass}
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
                      className={`${fieldClass} resize-none`}
                    />

                    <div className="admin-editor h-[250px] overflow-hidden rounded-[16px] border border-white/[0.08] bg-white [&_.quill]:h-full [&_.ql-container]:h-[205px] [&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto">
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
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="SEO title"
                        value={podcastForm.seoTitle}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            seoTitle: e.target.value,
                          })
                        }
                        className={fieldClass}
                      />

                      <textarea
                        rows="2"
                        placeholder="SEO description"
                        value={podcastForm.seoDescription}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            seoDescription: e.target.value,
                          })
                        }
                        className={`${fieldClass} resize-none`}
                      />
                    </div>

                    <button
                      onClick={savePodcast}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
                    >
                      <Save size={16} />
                      {editingPodcastId ? "Salva modifiche" : "Pubblica podcast"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 pb-16">
              <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
                    Archivio
                  </p>
                  <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                    Contenuti pubblicati
                  </h2>
                  <p className="mt-2 text-sm text-white/30">
                    Cerca e gestisci rapidamente i contenuti già online.
                  </p>
                </div>

                <div className="inline-flex w-fit rounded-[14px] border border-white/[0.07] bg-[#101010] p-1">
                  <button
                    onClick={() => {
                      setArchiveTab("articles")
                      setArchiveCategory("all")
                      setArchivePage(1)
                    }}
                    className={`rounded-[10px] px-4 py-2.5 text-xs font-black transition ${
                      archiveTab === "articles"
                        ? "bg-red-600 text-white"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Articoli
                    <span className="ml-2 text-[10px] opacity-60">
                      {articles.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setArchiveTab("podcasts")
                      setArchiveCategory("all")
                      setArchivePage(1)
                    }}
                    className={`rounded-[10px] px-4 py-2.5 text-xs font-black transition ${
                      archiveTab === "podcasts"
                        ? "bg-red-600 text-white"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    Podcast
                    <span className="ml-2 text-[10px] opacity-60">
                      {podcasts.length}
                    </span>
                  </button>
                </div>
              </div>

              <div className={`${panelClass} overflow-hidden`}>
                <div className="grid gap-3 border-b border-white/[0.07] p-4 md:grid-cols-[1fr_240px_auto] md:p-5">
                  <div className="flex items-center gap-3 rounded-[13px] border border-white/[0.08] bg-white/[0.025] px-4">
                    <Search size={16} className="shrink-0 text-white/25" />
                    <input
                      type="text"
                      value={archiveSearch}
                      onChange={(e) => {
                        setArchiveSearch(e.target.value)
                        setArchivePage(1)
                      }}
                      placeholder={`Cerca ${archiveTab === "articles" ? "articoli" : "podcast"}...`}
                      className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>

                  <select
                    value={archiveCategory}
                    onChange={(e) => {
                      setArchiveCategory(e.target.value)
                      setArchivePage(1)
                    }}
                    className="h-11 rounded-[13px] border border-white/[0.08] bg-[#151515] px-4 text-sm text-white/70 outline-none focus:border-red-500/35"
                  >
                    <option value="all">Tutte le categorie</option>
                    {archiveCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <div className="flex h-11 items-center rounded-[13px] border border-white/[0.07] bg-white/[0.02] px-4 text-xs font-bold text-white/30">
                    {archiveItems.length} risultati
                  </div>
                </div>

                {archiveVisibleItems.length > 0 ? (
                  <div className="divide-y divide-white/[0.06]">
                    {archiveVisibleItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3.5 p-4 transition hover:bg-white/[0.012] sm:items-center md:px-5"
                      >
                        <div className="h-[58px] w-[82px] shrink-0 overflow-hidden rounded-[10px] border border-white/[0.06] bg-white/[0.035] sm:h-[68px] sm:w-[96px]">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-[9px] font-black text-white/15">
                              {archiveTab === "articles" ? "ARTICOLO" : "PODCAST"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[9px] font-black uppercase tracking-[.15em] text-red-500">
                              {item.category || (archiveTab === "articles" ? "Articolo" : "Podcast")}
                            </p>
                            <span className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-0.5 text-[8px] font-black uppercase tracking-[.08em] text-emerald-400">
                              Pubblicato
                            </span>
                          </div>

                          <h4 className="mt-1.5 line-clamp-2 text-[14px] font-black leading-[1.16] sm:text-[15px]">
                            {item.title}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-white/22">
                            <span>
                              /{archiveTab === "articles" ? "articolo" : "podcast"}/{item.slug || item.id}
                            </span>
                            {item.publishDate && <span>{item.publishDate}</span>}
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2 self-center">
                          <button
                            onClick={() =>
                              archiveTab === "articles"
                                ? editArticle(item)
                                : editPodcast(item)
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/55 transition hover:border-red-500/30 hover:text-red-400"
                            aria-label={`Modifica ${archiveTab === "articles" ? "articolo" : "podcast"}`}
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() =>
                              archiveTab === "articles"
                                ? deleteArticle(item.id)
                                : deletePodcast(item.id)
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/15 bg-red-500/[0.06] text-red-400 transition hover:bg-red-500/15"
                            aria-label={`Elimina ${archiveTab === "articles" ? "articolo" : "podcast"}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-sm font-bold text-white/45">
                      Nessun contenuto trovato.
                    </p>
                    <p className="mt-1 text-xs text-white/22">
                      Prova a cambiare ricerca o categoria.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                  <p className="text-[11px] text-white/25">
                    Pagina {archiveSafePage} di {archiveTotalPages}
                    <span className="ml-2">
                      · {archivePerPage} per pagina
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={archiveSafePage <= 1}
                      onClick={() =>
                        setArchivePage((page) => Math.max(1, page - 1))
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.025] px-3 text-[11px] font-bold text-white/50 transition hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      <ChevronLeft size={14} />
                      Precedente
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                      {Array.from(
                        { length: Math.min(5, archiveTotalPages) },
                        (_, index) => {
                          let pageNumber

                          if (archiveTotalPages <= 5) {
                            pageNumber = index + 1
                          } else if (archiveSafePage <= 3) {
                            pageNumber = index + 1
                          } else if (archiveSafePage >= archiveTotalPages - 2) {
                            pageNumber = archiveTotalPages - 4 + index
                          } else {
                            pageNumber = archiveSafePage - 2 + index
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setArchivePage(pageNumber)}
                              className={`grid h-9 w-9 place-items-center rounded-[10px] text-[11px] font-black transition ${
                                archiveSafePage === pageNumber
                                  ? "bg-red-600 text-white"
                                  : "border border-white/[0.07] bg-white/[0.02] text-white/35 hover:text-white"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        }
                      )}
                    </div>

                    <button
                      disabled={archiveSafePage >= archiveTotalPages}
                      onClick={() =>
                        setArchivePage((page) =>
                          Math.min(archiveTotalPages, page + 1)
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.025] px-3 text-[11px] font-bold text-white/50 transition hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      Successiva
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
