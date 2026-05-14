import { useEffect, useState } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

import { db, auth } from "../firebase"
import Navbar from "../components/Navbar"

export default function AdminPage() {
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [articles, setArticles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    coverImage: "",
    publishDate: "",
    seoTitle: "",
    seoDescription: "",
  })

  const isAdmin = user?.email === ADMIN_EMAIL
  const articlesCollection = collection(db, "articles")

  async function loadArticles() {
    const data = await getDocs(articlesCollection)

    setArticles(
      data.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    )
  }

  useEffect(() => {
    loadArticles()

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
    if (!isAdmin) {
      setMessage("Solo l'admin può pubblicare articoli.")
      return
    }

    if (!form.title || !form.category || !form.description) {
      setMessage("Compila almeno titolo, categoria e descrizione.")
      return
    }

    const articleData = {
      ...form,
      publishDate:
        form.publishDate || new Date().toLocaleDateString("it-IT"),
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.description,
    }

    if (editingId) {
      await updateDoc(doc(db, "articles", editingId), articleData)
      setEditingId(null)
      setMessage("Articolo modificato correttamente.")
    } else {
      await addDoc(articlesCollection, articleData)
      setMessage("Articolo pubblicato correttamente.")
    }

    setForm({
      title: "",
      category: "",
      description: "",
      content: "",
      coverImage: "",
      publishDate: "",
      seoTitle: "",
      seoDescription: "",
    })

    loadArticles()
  }

  function editArticle(article) {
    setEditingId(article.id)

    setForm({
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

  async function deleteArticle(id) {
    await deleteDoc(doc(db, "articles", id))
    setMessage("Articolo eliminato.")
    loadArticles()
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

          {message && (
            <p className="mb-8 text-white/70 font-bold">
              {message}
            </p>
          )}

          {!isAdmin ? (
            <div className="max-w-xl p-8 rounded-[2rem] bg-white text-black">
              <h2 className="text-3xl font-black mb-6">
                Login admin
              </h2>

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
              <div className="flex justify-between items-center mb-10">
                <p className="text-white/50">
                  Accesso effettuato come{" "}
                  <span className="text-white font-bold">
                    {user.email}
                  </span>
                </p>

                <button
                  onClick={logoutAdmin}
                  className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10"
                >
                  Logout
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-white text-black">
                  <h2 className="text-3xl font-black mb-6">
                    {editingId ? "Modifica articolo" : "Nuovo articolo"}
                  </h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titolo articolo"
                      value={form.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Categoria"
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="URL immagine copertina"
                      value={form.coverImage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coverImage: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <input
                      type="date"
                      value={form.publishDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          publishDate: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="3"
                      placeholder="Descrizione breve"
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <div className="bg-white text-black rounded-2xl overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={form.content}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            content: value,
                          })
                        }
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="SEO title"
                      value={form.seoTitle}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          seoTitle: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                    />

                    <textarea
                      rows="3"
                      placeholder="SEO description"
                      value={form.seoDescription}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          seoDescription: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                    />

                    <button
                      onClick={saveArticle}
                      className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                    >
                      {editingId ? "Salva modifiche" : "Pubblica articolo"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-6 rounded-[2rem] bg-white/5 border border-white/10"
                    >
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-52 object-cover rounded-2xl mb-5"
                        />
                      )}

                      <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-3">
                        {article.category}
                      </p>

                      <h3 className="text-2xl font-black mb-3">
                        {article.title}
                      </h3>

                      <p className="text-white/50 mb-6">
                        {article.description}
                      </p>

                      <div className="flex gap-3">
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
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}