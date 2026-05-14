import { useState } from "react"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"
import { useNavigate } from "react-router-dom"

import { auth, db } from "../firebase"
import Navbar from "../components/Navbar"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    username: "",
    birthDate: "",
    city: "",
    interests: "",
    bio: "",
  })

  async function saveRegistration(email, provider) {
    await addDoc(collection(db, "registrations"), {
      email,
      provider,
      createdAt: serverTimestamp(),
    })
  }

  async function registerUser() {
    try {
      setMessage("")

      if (
        !form.email ||
        !form.password ||
        !form.displayName ||
        !form.username ||
        !form.birthDate
      ) {
        setMessage("Compila email, password, nome, username e data di nascita.")
        return
      }

      if (form.password.length < 6) {
        setMessage("La password deve avere almeno 6 caratteri.")
        return
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )

      await sendEmailVerification(userCredential.user)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: form.email,
        displayName: form.displayName,
        username: form.username,
        birthDate: form.birthDate,
        city: form.city,
        interests: form.interests,
        bio: form.bio,
        avatarUrl: "",
        provider: "email",
        profileCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await saveRegistration(form.email, "email")
      await signOut(auth)

      navigate("/")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setMessage("Questa email è già registrata.")
      } else {
        setMessage("Errore durante la registrazione.")
      }
    }
  }

  async function registerWithGoogle() {
    try {
      setMessage("")

      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          email: result.user.email,
          displayName: result.user.displayName || "",
          avatarUrl: result.user.photoURL || "",
          provider: "google",
          profileCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await saveRegistration(result.user.email, "google")

      navigate("/complete-profile")
    } catch {
      setMessage("Errore registrazione Google.")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6 pb-28">
        <div className="max-w-2xl mx-auto p-8 rounded-[2rem] bg-white text-black">
          <h1 className="text-4xl font-black mb-6">Registrati</h1>

          {message && <p className="mb-5 font-bold">{message}</p>}

          <div className="space-y-4">
            <button
              onClick={registerWithGoogle}
              className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Continua con Google
            </button>

            <div className="text-center text-black/40 font-bold">oppure</div>

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

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password almeno 6 caratteri"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <label className="flex gap-2 text-black/60 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Mostra password
            </label>

            <button
              onClick={registerUser}
              className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Crea account
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}