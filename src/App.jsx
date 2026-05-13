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

import { db, auth } from "./firebase"

export default function App() {
  const [stories, setStories] = useState([])
  const [podcasts, setPodcasts] = useState([])

  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedPodcast, setSelectedPodcast] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editingPodcastId, setEditingPodcastId] = useState(null)

  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
  })

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

  const articlesCollection = collection(db, "articles")
  const podcastsCollection = collection(db, "podcasts")

  async function loadStories() {
    const data = await getDocs(articlesCollection)

    setStories(
      data.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )
  }

  async function loadPodcasts() {
    const data = await getDocs(podcastsCollection)

    setPodcasts(
      data.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )
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

      await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      )

      setMessage("Accesso effettuato.")
    } catch {
      setMessage("Credenziali non valide.")
    }
  }

  async function registerUser() {
    try {
      setMessage("")

      await createUserWithEmailAndPassword(
        auth,
        registerForm.email,
        registerForm.password
      )

      setMessage("Registrazione completata.")
    } catch {
      setMessage("Errore registrazione.")
    }
  }

  async function logoutAdmin() {
    await signOut(auth)
    setMessage("Logout effettuato.")
  }

  async function saveStory() {
    if (!user) return

    if (editingId) {
      await updateDoc(doc(db, "articles", editingId), form)

      setMessage("Articolo modificato.")
      setEditingId(null)
    } else {
      await addDoc(articlesCollection, form)

      setMessage("Articolo pubblicato.")
    }

    setForm({
      tag: "",
      title: "",
      desc: "",
      content: "",
    })

    loadStories()
  }

  async function deleteStory(id) {
    await deleteDoc(doc(db, "articles", id))

    setMessage("Articolo eliminato.")
    loadStories()
  }

  function startEdit(story) {
    setEditingId(story.id)

    setForm({
      tag: story.tag,
      title: story.title,
      desc: story.desc,
      content: story.content,
    })
  }

  async function savePodcast() {
    if (!user) return

    if (editingPodcastId) {
      await updateDoc(doc(db, "podcasts", editingPodcastId), podcastForm)

      setMessage("Podcast modificato.")
      setEditingPodcastId(null)
    } else {
      await addDoc(podcastsCollection, podcastForm)

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

    loadPodcasts()
  }

  async function deletePodcast(id) {
    await deleteDoc(doc(db, "podcasts", id))

    setMessage("Podcast eliminato.")
    loadPodcasts()
  }

  function startEditPodcast(podcast) {
    setEditingPodcastId(podcast.id)

    setPodcastForm({
      category: podcast.category,
      title: podcast.title,
      desc: podcast.desc,
      content: podcast.content,
      image: podcast.image,
      videoUrl: podcast.videoUrl,
    })
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
            {selectedArticle.content}
          </div>
        </div>
      </main>
    )
  }

  if (selectedPodcast) {
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

          <div className="aspect-video rounded-[2rem] overflow-hidden mb-10">
            <iframe
              src={selectedPodcast.videoUrl}
              title={selectedPodcast.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          <p className="text-xl text-white/50 leading-relaxed mb-12">
            {selectedPodcast.desc}
          </p>

          <div className="text-lg leading-relaxed text-white/80 whitespace-pre-line">
            {selectedPodcast.content}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-black">
            FattiDiretti
          </h1>

          <div className="hidden md:flex gap-8 text-sm text-white/60">
            <a href="#">Home</a>
            <a href="#stories">Articoli</a>
            <a href="#podcast">Podcast</a>
            <a href="#register">Registrati</a>
            <a href="#admin">Admin</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center px-6 pt-32">
        <div className="relative max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.45em] text-white/45 text-xs md:text-sm mb-7">
            Giornalismo • Podcast • Reportage
          </p>

          <h2 className="text-6xl md:text-8xl font-black leading-[0.88] mb-8">
            FATTI
            <span className="block text-white/35">
              DIRETTI
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/65 max-w-2xl mb-10 leading-relaxed">
            FattiDiretti racconta storie, reportage, podcast e realtà
            nascoste con uno stile moderno, aggressivo ed editoriale.
          </p>
        </div>
      </section>

      <section id="stories" className="px-6 py-28 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-14">
            Articoli
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story) => (
              <motion.article
                key={story.id}
                whileHover={{ y: -12 }}
                onClick={() => setSelectedArticle(story)}
                className="cursor-pointer p-8 rounded-[2rem] bg-black text-white"
              >
                <p className="text-white/40 mb-4 uppercase text-xs">
                  {story.tag}
                </p>

                <h3 className="text-3xl font-black mb-6">
                  {story.title}
                </h3>

                <p className="text-white/50">
                  {story.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="podcast" className="px-6 py-28 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-14">
            Video Podcast
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {podcasts.map((podcast) => (
              <motion.div
                key={podcast.id}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedPodcast(podcast)}
                className="cursor-pointer rounded-[2rem] overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="w-full aspect-video object-cover"
                />

                <div className="p-7">
                  <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                    {podcast.category}
                  </p>

                  <h3 className="text-3xl font-black mb-5">
                    {podcast.title}
                  </h3>

                  <p className="text-white/50">
                    {podcast.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}