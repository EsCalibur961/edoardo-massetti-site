import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

import { auth, db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function CompleteProfilePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    birthDate: "",
    city: "",
    interests: "",
    bio: "",
    avatarUrl: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser) {
        navigate("/login")
        return
      }

      const snap = await getDoc(doc(db, "users", currentUser.uid))

      if (snap.exists()) {
        const data = snap.data()

        setForm({
          displayName: data.displayName || currentUser.displayName || "",
          username: data.username || "",
          birthDate: data.birthDate || "",
          city: data.city || "",
          interests: data.interests || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || currentUser.photoURL || "",
        })
      }
    })

    return () => unsubscribe()
  }, [navigate])

  async function completeProfile() {
    if (!user) return

    if (!form.displayName || !form.username || !form.birthDate) {
      setMessage("Inserisci nome da visualizzare, username e data di nascita.")
      return
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        ...form,
        email: user.email,
        provider: "google",
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    navigate("/")
  }

  const fieldClass =
    "w-full rounded-[14px] border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-red-500/45 focus:bg-white/[0.05]"

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="fd-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Ultimo passaggio
              </p>
            </div>

            <h1 className="mt-4 text-[44px] font-black leading-[.96] tracking-[-.05em] sm:text-[56px]">
              Completa il profilo.
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/36">
              Hai effettuato l’accesso con Google. Aggiungi i dati principali per
              completare il tuo account FattiDiretti.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/[0.07] bg-[#101010] p-6 sm:p-8">
            {message && (
              <div className="mb-6 rounded-[13px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
                {message}
              </div>
            )}

            <div className="grid gap-3.5 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nome da visualizzare"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                className={fieldClass}
              />

              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={fieldClass}
              />

              <input
                type="date"
                value={form.birthDate}
                onChange={(e) =>
                  setForm({ ...form, birthDate: e.target.value })
                }
                className={fieldClass}
              />

              <input
                type="text"
                placeholder="Città"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={fieldClass}
              />

              <input
                type="text"
                placeholder="Interessi"
                value={form.interests}
                onChange={(e) =>
                  setForm({ ...form, interests: e.target.value })
                }
                className={`${fieldClass} sm:col-span-2`}
              />

              <textarea
                rows="4"
                placeholder="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className={`${fieldClass} resize-none sm:col-span-2`}
              />
            </div>

            <button
              onClick={completeProfile}
              className="mt-6 w-full rounded-[14px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
            >
              Completa profilo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
