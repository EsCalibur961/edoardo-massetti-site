import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

import { auth, db } from "../firebase"
import Navbar from "../components/Navbar"

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

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6 pb-28">
        <div className="max-w-2xl mx-auto p-8 rounded-[2rem] bg-white text-black">
          <h1 className="text-4xl font-black mb-6">Completa profilo</h1>

          <p className="text-black/60 mb-6">
            Inserisci i dati principali per completare il tuo account.
          </p>

          {message && <p className="mb-5 font-bold">{message}</p>}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome da visualizzare"
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type="text"
              placeholder="Città"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type="text"
              placeholder="Interessi"
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <textarea
              rows="4"
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
            />

            <button
              onClick={completeProfile}
              className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Completa profilo
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}