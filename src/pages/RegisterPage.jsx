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
import { Link, useNavigate } from "react-router-dom"

import { auth, db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

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
        setMessage(
          "Compila email, password, nome, username e data di nascita."
        )
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

  const fieldClass =
    "w-full rounded-[13px] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-red-500/45 focus:bg-white/[0.05]"

  const labelClass =
    "mb-2 block text-[9px] font-black uppercase tracking-[.15em] text-white/28"

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="fd-container pb-16 pt-16 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-red-600" />
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
                Community
              </p>
            </div>

            <h1 className="mt-5 text-[44px] font-black leading-[.96] tracking-[-.05em] sm:text-[56px]">
              Crea il tuo profilo.
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/36">
              Registrati per commentare, personalizzare il tuo profilo e ricevere
              gli aggiornamenti di FattiDiretti.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/[0.07] bg-[#101010] p-5 sm:p-7">
            {message && (
              <div className="mb-6 rounded-[13px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
                {message}
              </div>
            )}

            <button
              onClick={registerWithGoogle}
              className="w-full rounded-[13px] bg-white px-5 py-3.5 text-sm font-black text-black transition hover:bg-white/90"
            >
              Continua con Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/20">
                oppure
              </span>
              <span className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <section>
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-red-500">
                  Dati personali
                </p>
                <p className="mt-1 text-xs text-white/28">
                  Le informazioni principali del tuo profilo.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className={fieldClass}
                />

                <div>
                  <label className={labelClass}>Data di nascita</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) =>
                      setForm({ ...form, birthDate: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Città</label>
                  <input
                    type="text"
                    placeholder="Es. Palermo"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>

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
                  rows="3"
                  placeholder="Bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  className={`${fieldClass} resize-none sm:col-span-2`}
                />
              </div>
            </section>

            <div className="my-6 h-px bg-white/[0.07]" />

            <section>
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-red-500">
                  Credenziali
                </p>
                <p className="mt-1 text-xs text-white/28">
                  Serviranno per accedere al tuo account.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={fieldClass}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password almeno 6 caratteri"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>

              <label className="mt-3 flex items-center gap-2.5 text-xs text-white/35">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(!showPassword)
                  }
                  className="accent-red-600"
                />
                Mostra password
              </label>
            </section>

            <button
              onClick={registerUser}
              className="mt-6 w-full rounded-[13px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
            >
              Crea account
            </button>

            <p className="mt-6 border-t border-white/[0.07] pt-5 text-center text-sm text-white/35">
              Hai già un account?{" "}
              <Link
                to="/login"
                className="font-black text-red-500 hover:text-red-400"
              >
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
