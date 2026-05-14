import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, auth, storage } from "./firebase"

export default function App() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [stories, setStories] = useState([])
  const [podcasts, setPodcasts] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedPodcast, setSelectedPodcast] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingPodcastId, setEditingPodcastId] = useState(null)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")
  const [videoFile, setVideoFile] = useState(null)

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ email: "", password: "" })

  const [form, setForm] = useState({
    tag: "",
    title: "",
    desc: "",
    content: "",
  })

  const [podcastForm, setPodcastForm] = useState({
    category: "",
    title: "",
    desc: "",
    content: "",
    image: "",
    videoUrl: "",
  })

  const isAdmin = user?.email === ADMIN_EMAIL
  const articlesCollection = collection(db, "articles")
  const podcastsCollection = collection(db, "podcasts")

  async function loadStories() {
    const data = await getDocs(articlesCollection)
    setStories(data.docs.map((item) => ({ id: item.id, ...item.data() })))
  }

  async function loadPodcasts() {
    const data = await getDocs(podcastsCollection)
    setPodcasts(data.docs.map((item) => ({ id: item.id, ...item.data() })))
  }

  useEffect(() => {
    loadStories()
    loadPodcasts()

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  async function loginAdmin() {
    try {
      setMessage("")
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password)
      setLoginForm({ email: "", password: "" })
      setMessage("Accesso effettuato.")
    } catch {
      setMessage("Email o password non corretti.")
    }
  }

  async function registerUser() {
    try {
      setMessage("")

      if (!registerForm.email || !registerForm.password) {
        setMessage("Inserisci email e password.")
        return
      }

      if (registerForm.password.length < 6) {
        setMessage("La password deve avere almeno 6 caratteri.")
        return
      }

      await createUserWithEmailAndPassword(
        auth,
        registerForm.email,
        registerForm.password
      )

      await signOut(auth)

      setRegisterForm({ email: "", password: "" })
      setMessage("Registrazione completata.")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setMessage("Questa email è già registrata.")
      } else {
        setMessage("Errore durante la registrazione.")
      }
    }
  }

  async function logoutAdmin() {
    await signOut(auth)
    setMessage("Logout effettuato.")
  }

  async function saveStory() {
    if (!isAdmin) {
      setMessage("Solo l'admin può pubblicare articoli.")
      return
    }

    if (!form.tag || !form.title || !form.desc) {
      setMessage("Compila almeno categoria, titolo e descrizione.")
      return
    }

    if (editingId) {
      await updateDoc(doc(db, "articles", editingId), form)
      setEditingId(null)
      setMessage("Articolo modificato.")
    } else {
      await addDoc(articlesCollection, form)
      setMessage("Articolo pubblicato.")
    }

    setForm({ tag: "", title: "", desc: "", content: "" })
    loadStories()
  }

  function startEdit(story) {
    if (!isAdmin) return

    setEditingId(story.id)
    setForm({
      tag: story.tag || "",
      title: story.title || "",
      desc: story.desc || "",
      content: story.content || "",
    })
  }

  async function deleteStory(id) {
    if (!isAdmin) return

    await deleteDoc(doc(db, "articles", id))
    setMessage("Articolo eliminato.")
    loadStories()
  }

  async function savePodcast() {
    if (!isAdmin) {
      setMessage("Solo l'admin può pubblicare podcast.")
      return
    }

    if (!podcastForm.category || !podcastForm.title || !podcastForm.desc) {
      setMessage("Compila almeno categoria, titolo e descrizione podcast.")
      return
    }

    let finalVideoUrl = podcastForm.videoUrl

    if (videoFile) {
      setMessage("Caricamento video in corso...")

      const videoRef = ref(storage, `podcasts/${Date.now()}-${videoFile.name}`)
      await uploadBytes(videoRef, videoFile)
      finalVideoUrl = await getDownloadURL(videoRef)
    }

    const podcastData = {
      ...podcastForm,
      videoUrl: finalVideoUrl,
    }

    if (editingPodcastId) {
      await updateDoc(doc(db, "podcasts", editingPodcastId), podcastData)
      setEditingPodcastId(null)
      setMessage("Podcast modificato.")
    } else {
      await addDoc(podcastsCollection, podcastData)
      setMessage("Podcast pubblicato.")
    }

    setPodcastForm({
      category: "",
      title: "",
      desc: "",
      content: "",
      image: "",
      videoUrl: "",
    })

    setVideoFile(null)
    loadPodcasts()
  }

  function startEditPodcast(podcast) {
    if (!isAdmin) return

    setEditingPodcastId(podcast.id)
    setPodcastForm({
      category: podcast.category || "",
      title: podcast.title || "",
      desc: podcast.desc || "",
      content: podcast.content || "",
      image: podcast.image || "",
      videoUrl: podcast.videoUrl || "",
    })
  }

  async function deletePodcast(id) {
    if (!isAdmin) return

    await deleteDoc(doc(db, "podcasts", id))
    setMessage("Podcast eliminato.")
    loadPodcasts()
  }

  if (selectedArticle) {
    return (
      <main className="min-h-screen bg-[#080808] text-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-10 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            ← Torna alla home
          </button>

          <p className="uppercase tracking-[0.35em] text-white/40 text-sm mb-6">
            {selectedArticle.tag}
          </p>

          <h1 className="text-5xl md:text-7xl font-black mb-10 leading-tight">
            {selectedArticle.title}
          </h1>

          <p className="text-xl text-white/50 leading-relaxed mb-12">
            {selectedArticle.desc}
          </p>

          <div className="text-lg leading-relaxed text-white/80 whitespace-pre-line">
            {selectedArticle.content ||
              "Contenuto completo non ancora inserito."}
          </div>
        </div>
      </main>
    )
  }

  if (selectedPodcast) {
    const isUploadedVideo = selectedPodcast.videoUrl?.includes("firebasestorage")

    return (
      <main className="min-h-screen bg-[#080808] text-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedPodcast(null)}
            className="mb-10 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition"
          >
            ← Torna alla home
          </button>

          <p className="uppercase tracking-[0.35em] text-white/40 text-sm mb-6">
            {selectedPodcast.category}
          </p>

          <h1 className="text-5xl md:text-7xl font-black mb-10 leading-tight">
            {selectedPodcast.title}
          </h1>

          {selectedPodcast.videoUrl ? (
            <div className="aspect-video rounded-[2rem] overflow-hidden mb-10 bg-black">
              {isUploadedVideo ? (
                <video
                  src={selectedPodcast.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={selectedPodcast.videoUrl}
                  title={selectedPodcast.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
          ) : selectedPodcast.image ? (
            <img
              src={selectedPodcast.image}
              alt={selectedPodcast.title}
              className="w-full rounded-[2rem] mb-10"
            />
          ) : null}

          <p className="text-xl text-white/50 leading-relaxed mb-12">
            {selectedPodcast.desc}
          </p>

          <div className="text-lg leading-relaxed text-white/80 whitespace-pre-line">
            {selectedPodcast.content ||
              "Descrizione completa non ancora inserita."}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-black">FattiDiretti</h1>

          <div className="hidden md:flex gap-8 text-sm text-white/60">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#stories" className="hover:text-white transition">Articoli</a>
            <a href="#podcast" className="hover:text-white transition">Podcast</a>
            <a href="#register" className="hover:text-white transition">Registrati</a>
            <a href="#admin" className="hover:text-white transition">Admin</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center px-6 pt-32">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(255,255,255,0.18),transparent_36%)]"
        />

        <div className="relative max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.45em] text-white/45 text-xs md:text-sm mb-7">
            Giornalismo • Podcast • Reportage
          </p>

          <h2 className="text-6xl md:text-8xl font-black leading-[0.88] mb-8">
            FATTI
            <span className="block text-white/35">DIRETTI</span>
          </h2>

          <p className="text-lg md:text-xl text-white/65 max-w-2xl mb-10 leading-relaxed">
            FattiDiretti racconta storie, reportage, podcast e realtà nascoste
            con uno stile moderno, aggressivo ed editoriale.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#stories"
              className="px-8 py-4 rounded-full bg-white text-black font-black text-center hover:scale-105 transition"
            >
              Leggi articoli
            </a>

            <a
              href="#podcast"
              className="px-8 py-4 rounded-full border border-white/20 text-center hover:bg-white/10 transition"
            >
              Guarda podcast
            </a>
          </div>
        </div>
      </section>

      <section id="stories" className="px-6 py-28 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-14">Articoli</h2>

          {stories.length === 0 ? (
            <p className="text-black/50 text-xl">Nessun articolo pubblicato.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <motion.article
                  key={story.id}
                  whileHover={{ y: -12 }}
                  onClick={() => setSelectedArticle(story)}
                  className="cursor-pointer p-8 rounded-[2rem] bg-black text-white min-h-[320px]"
                >
                  <p className="text-white/40 mb-4 uppercase text-xs tracking-[0.25em]">
                    {story.tag}
                  </p>

                  <h3 className="text-3xl font-black mb-6">{story.title}</h3>

                  <p className="text-white/50">{story.desc}</p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="podcast" className="px-6 py-28 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-14">
            Video Podcast
          </h2>

          {podcasts.length === 0 ? (
            <p className="text-white/50 text-xl">Nessun podcast pubblicato.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {podcasts.map((podcast) => (
                <motion.div
                  key={podcast.id}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedPodcast(podcast)}
                  className="cursor-pointer rounded-[2rem] overflow-hidden bg-white/5 border border-white/10"
                >
                  {podcast.image && (
                    <img
                      src={podcast.image}
                      alt={podcast.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}

                  <div className="p-7">
                    <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                      {podcast.category}
                    </p>

                    <h3 className="text-3xl font-black mb-5">
                      {podcast.title}
                    </h3>

                    <p className="text-white/50">{podcast.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="register" className="px-6 py-28 bg-white text-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-black/40 text-sm">
              Community
            </p>

            <h2 className="text-5xl md:text-7xl font-black mt-4 mb-8">
              Registrazione facoltativa.
            </h2>

            <p className="text-xl text-black/60 leading-relaxed">
              Gli utenti possono registrarsi per ricevere aggiornamenti,
              contenuti extra, podcast e futuri contenuti premium.
            </p>
          </div>

          <div className="p-8 rounded-[2rem] bg-black text-white">
            <h3 className="text-3xl font-black mb-6">Crea account</h3>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
              />

              <input
                type="password"
                placeholder="Password almeno 6 caratteri"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
              />

              <button
                onClick={registerUser}
                className="w-full px-8 py-4 rounded-full bg-white text-black font-black hover:scale-[1.02] transition"
              >
                Registrati
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="admin" className="px-6 py-28 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
            Area riservata
          </p>

          <h2 className="text-5xl md:text-7xl font-black mt-4 mb-10">
            Admin FattiDiretti
          </h2>

          {message && <p className="mb-8 text-white/70 font-bold">{message}</p>}

          {!isAdmin ? (
            <div className="max-w-xl p-8 rounded-[2rem] bg-white text-black">
              <h3 className="text-3xl font-black mb-6">Login admin</h3>

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
                  type="password"
                  placeholder="Password admin"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <button
                  onClick={loginAdmin}
                  className="w-full px-8 py-4 rounded-full bg-black text-white font-black hover:scale-[1.02] transition"
                >
                  Accedi come admin
                </button>

                {user && (
                  <button
                    onClick={logoutAdmin}
                    className="w-full px-8 py-4 rounded-full border border-black/20 text-black font-black hover:bg-black/5 transition"
                  >
                    Esci dall'account attuale
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <p className="text-white/50">
                  Accesso admin effettuato come{" "}
                  <span className="text-white font-bold">{user.email}</span>
                </p>

                <button
                  onClick={logoutAdmin}
                  className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white text-black">
                  <h3 className="text-3xl font-black mb-6">
                    {editingId ? "Modifica articolo" : "Nuovo articolo"}
                  </h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Categoria"
                      value={form.tag}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Titolo"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="4"
                      placeholder="Descrizione breve"
                      value={form.desc}
                      onChange={(e) => setForm({ ...form, desc: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <textarea
                      rows="8"
                      placeholder="Contenuto completo articolo"
                      value={form.content}
                      onChange={(e) =>
                        setForm({ ...form, content: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <button
                      onClick={saveStory}
                      className="w-full px-8 py-4 rounded-full bg-black text-white font-black hover:scale-[1.02] transition"
                    >
                      {editingId ? "Salva modifiche" : "Pubblica articolo"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                    >
                      <p className="text-white/40 uppercase tracking-[0.25em] text-xs mb-3">
                        {story.tag}
                      </p>

                      <h3 className="text-2xl font-black mb-3">{story.title}</h3>

                      <p className="text-white/50 mb-6">{story.desc}</p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(story)}
                          className="px-5 py-3 rounded-full bg-white text-black font-bold"
                        >
                          Modifica
                        </button>

                        <button
                          onClick={() => deleteStory(story.id)}
                          className="px-5 py-3 rounded-full border border-red-400/40 text-red-300 font-bold"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-20">
                <h2 className="text-4xl md:text-5xl font-black mb-10">
                  Gestione Video Podcast
                </h2>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[2rem] bg-white text-black">
                    <h3 className="text-3xl font-black mb-6">
                      {editingPodcastId ? "Modifica podcast" : "Nuovo podcast"}
                    </h3>

                    <div className="space-y-4">
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

                      <textarea
                        rows="4"
                        placeholder="Descrizione breve podcast"
                        value={podcastForm.desc}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            desc: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                      />

                      <textarea
                        rows="6"
                        placeholder="Contenuto completo podcast"
                        value={podcastForm.content}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            content: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                      />

                      <input
                        type="text"
                        placeholder="URL immagine copertina"
                        value={podcastForm.image}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            image: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                      />

                      <input
                        type="text"
                        placeholder="URL video YouTube embed oppure link video"
                        value={podcastForm.videoUrl}
                        onChange={(e) =>
                          setPodcastForm({
                            ...podcastForm,
                            videoUrl: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                      />

                      <div>
                        <p className="text-sm font-bold mb-2">
                          Oppure carica video dal dispositivo
                        </p>

                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files[0])}
                          className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                        />
                      </div>

                      <button
                        onClick={savePodcast}
                        className="w-full px-8 py-4 rounded-full bg-black text-white font-black hover:scale-[1.02] transition"
                      >
                        {editingPodcastId ? "Salva podcast" : "Pubblica podcast"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {podcasts.map((podcast) => (
                      <div
                        key={podcast.id}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                      >
                        {podcast.image && (
                          <img
                            src={podcast.image}
                            alt={podcast.title}
                            className="w-full h-52 object-cover rounded-2xl mb-6"
                          />
                        )}

                        <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-3">
                          {podcast.category}
                        </p>

                        <h3 className="text-2xl font-black mb-3">
                          {podcast.title}
                        </h3>

                        <p className="text-white/50 mb-6">{podcast.desc}</p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => startEditPodcast(podcast)}
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
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4 text-sm text-white/40">
          <p>© 2026 FattiDiretti</p>
          <p>Giornalismo moderno • Video Podcast • Editoriale</p>
        </div>
      </footer>
    </main>
  )
}