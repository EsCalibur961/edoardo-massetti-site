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
  const [editingId, setEditingId] = useState(null)
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
  })

  const storiesCollection = collection(db, "articles")

  async function loadStories() {
    const data = await getDocs(storiesCollection)
    const articles = data.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }))

    setStories(articles)
  }

  useEffect(() => {
    loadStories()

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

      await createUserWithEmailAndPassword(
        auth,
        registerForm.email,
        registerForm.password
      )

      setRegisterForm({ email: "", password: "" })
      setMessage("Registrazione completata.")
    } catch {
      setMessage("Errore durante la registrazione.")
    }
  }

  async function logoutAdmin() {
    await signOut(auth)
    setMessage("Logout effettuato.")
  }

  async function saveStory() {
    if (!user) return

    if (!form.tag || !form.title || !form.desc) {
      setMessage("Compila tutti i campi dell'articolo.")
      return
    }

    if (editingId) {
      await updateDoc(doc(db, "articles", editingId), form)
      setEditingId(null)
      setMessage("Articolo modificato.")
    } else {
      await addDoc(storiesCollection, form)
      setMessage("Articolo pubblicato.")
    }

    setForm({ tag: "", title: "", desc: "" })
    loadStories()
  }

  function startEdit(story) {
    setEditingId(story.id)
    setForm({
      tag: story.tag,
      title: story.title,
      desc: story.desc,
    })
  }

  async function deleteStory(id) {
    if (!user) return

    await deleteDoc(doc(db, "articles", id))
    setMessage("Articolo eliminato.")
    loadStories()
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-lg md:text-2xl font-black tracking-tight"
          >
            Edoardo Massetti
          </motion.h1>

          <div className="hidden md:flex gap-8 text-sm text-white/60">
            <a href="#stories" className="hover:text-white transition">
              Articoli
            </a>
            <a href="#podcast" className="hover:text-white transition">
              Podcast
            </a>
            <a href="#register" className="hover:text-white transition">
              Registrati
            </a>
            <a href="#admin" className="hover:text-white transition">
              Admin
            </a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center px-6 pt-32">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(255,255,255,0.18),transparent_36%)]"
        />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 55 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <p className="uppercase tracking-[0.45em] text-white/45 text-xs md:text-sm mb-7">
              Giornalista • Cronista • Storyteller
            </p>

            <h2 className="text-6xl md:text-8xl font-black leading-[0.88] mb-8">
              Eleganza
              <span className="block text-white/35">nella forma.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                Verità nel colpo.
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/65 max-w-xl mb-10 leading-relaxed">
              Edoardo Massetti racconta storie, persone e realtà nascoste con
              uno stile moderno, diretto e visivamente potente.
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
                Ascolta podcast
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 45 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/18 via-white/7 to-white/3 shadow-2xl overflow-hidden flex items-end">
              <div className="p-8">
                <p className="text-6xl md:text-8xl font-black text-white/10">
                  MASSETTI
                </p>
                <p className="text-white/55 mt-4">
                  Immagine editoriale in arrivo.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 md:-left-8 bg-white text-black p-6 rounded-3xl shadow-2xl max-w-xs">
              <p className="text-xs font-black uppercase text-black/45 tracking-[0.25em]">
                Articoli pubblicati
              </p>
              <h3 className="text-4xl font-black mt-3">{stories.length}</h3>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="stories" className="px-6 py-28 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-black/40 text-sm">
            Selected Articles
          </p>

          <h2 className="text-5xl md:text-7xl font-black mt-4 mb-14">
            Articoli in evidenza
          </h2>

          {stories.length === 0 ? (
            <p className="text-black/50 text-xl">
              Nessun articolo pubblicato.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <motion.article
                  key={story.id}
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="group p-8 rounded-[2rem] bg-black text-white min-h-[360px] flex flex-col justify-between cursor-pointer border border-white/10 hover:border-white/30 transition"
                >
                  <div>
                    <p className="text-white/40 text-sm mb-5 uppercase tracking-[0.25em]">
                      {story.tag}
                    </p>

                    <h3 className="text-3xl font-black leading-tight">
                      {story.title}
                    </h3>
                  </div>

                  <p className="text-white/50 mt-8 leading-relaxed">
                    {story.desc}
                  </p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="podcast" className="px-6 py-28 border-t border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
            Podcast
          </p>

          <h2 className="text-5xl md:text-7xl font-black mt-4 mb-10">
            Voci, storie e approfondimenti.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/30 transition"
              >
                <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                  Episodio {item}
                </p>

                <h3 className="text-3xl font-black mb-5">
                  Dentro la notizia
                </h3>

                <p className="text-white/50 mb-8 leading-relaxed">
                  Un podcast editoriale tra attualità, storie reali e
                  retroscena.
                </p>

                <button className="px-6 py-3 rounded-full bg-white text-black font-black hover:scale-105 transition">
                  Ascolta
                </button>
              </motion.div>
            ))}
          </div>
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
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value,
                  })
                }
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
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
            Admin Edoardo
          </h2>

          {message && (
            <p className="mb-8 text-white/70 font-bold">{message}</p>
          )}

          {!user ? (
            <div className="max-w-xl p-8 rounded-[2rem] bg-white text-black">
              <h3 className="text-3xl font-black mb-6">Login admin</h3>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
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
                  placeholder="Password"
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
                  className="w-full px-8 py-4 rounded-full bg-black text-white font-black hover:scale-[1.02] transition"
                >
                  Accedi
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <p className="text-white/50">
                  Accesso effettuato come{" "}
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
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tag: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Titolo"
                      value={form.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="5"
                      placeholder="Descrizione"
                      value={form.desc}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          desc: e.target.value,
                        })
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

                      <h3 className="text-2xl font-black mb-3">
                        {story.title}
                      </h3>

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
            </div>
          )}
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4 text-sm text-white/40">
          <p>© 2026 Edoardo Massetti</p>
          <p>Giornalismo moderno • Podcast • Editoriale</p>
        </div>
      </footer>
    </main>
  )
}