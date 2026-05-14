import { useState } from "react"

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import {
  auth,
  db,
} from "../firebase"

import Navbar from "../components/Navbar"

export default function RegisterPage() {
  const [showPassword, setShowPassword] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  async function saveRegistration(
    email,
    provider
  ) {
    await addDoc(
      collection(db, "registrations"),
      {
        email,
        provider,
        createdAt:
          serverTimestamp(),
      }
    )
  }

  async function registerUser() {
    try {
      setMessage("")

      if (
        !form.email ||
        !form.password
      ) {
        setMessage(
          "Inserisci email e password."
        )

        return
      }

      if (
        form.password.length < 6
      ) {
        setMessage(
          "La password deve avere almeno 6 caratteri."
        )

        return
      }

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        )

      await sendEmailVerification(
        userCredential.user
      )

      await saveRegistration(
        form.email,
        "email"
      )

      await signOut(auth)

      setForm({
        email: "",
        password: "",
      })

      setMessage(
        "Registrazione completata. Controlla la tua email."
      )
    } catch {
      setMessage(
        "Errore durante la registrazione."
      )
    }
  }

  async function registerWithGoogle() {
    try {
      const provider =
        new GoogleAuthProvider()

      const result =
        await signInWithPopup(
          auth,
          provider
        )

      await saveRegistration(
        result.user.email,
        "google"
      )

      setMessage(
        "Registrazione Google completata."
      )
    } catch {
      setMessage(
        "Errore registrazione Google."
      )
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6">
        <div className="max-w-xl mx-auto p-8 rounded-[2rem] bg-white text-black">
          <h1 className="text-4xl font-black mb-6">
            Registrati
          </h1>

          {message && (
            <p className="mb-5 font-bold">
              {message}
            </p>
          )}

          <div className="space-y-4">
            <button
              onClick={
                registerWithGoogle
              }
              className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Continua con Google
            </button>

            <div className="text-center text-black/40 font-bold">
              oppure
            </div>

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password almeno 6 caratteri"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <label className="flex gap-2 text-black/60 text-sm">
              <input
                type="checkbox"
                checked={
                  showPassword
                }
                onChange={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
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