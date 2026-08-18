import { useState } from "react"
import {
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth"
import { Link, useNavigate } from "react-router-dom"
import { auth, db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function LoginPage() {
  const navigate = useNavigate()
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  async function loginUser() {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      )

      const currentUser = userCredential.user
      let isAdmin = currentUser.email === ADMIN_EMAIL

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid))
        isAdmin = isAdmin || userSnap.data()?.role === "admin"
      } catch {
        // Se il profilo utente non è leggibile, resta valido il controllo email admin.
      }

      if (!currentUser.emailVerified && !isAdmin) {
        await signOut(auth)
        setMessage("Devi prima verificare la tua email.")
        return
      }

      navigate(isAdmin ? "/admin" : "/")
    } catch {
      setMessage("Email o password non corretti.")
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate("/complete-profile")
    } catch {
      setMessage("Errore login Google.")
    }
  }

  const fieldClass =
    "w-full rounded-[14px] border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-red-500/45 focus:bg-white/[0.05]"

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="fd-container grid min-h-[calc(100vh-74px)] items-start gap-10 pb-12 pt-8 sm:pt-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-16">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-red-600" />
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
              Area personale
            </p>
          </div>

          <h1 className="mt-5 max-w-xl text-[58px] font-black leading-[.94] tracking-[-.055em]">
            Torna dentro
            <span className="block text-white/25">FattiDiretti.</span>
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-7 text-white/38">
            Accedi per gestire il tuo profilo, partecipare alle conversazioni e
            utilizzare le funzioni riservate agli utenti registrati.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[560px] rounded-[22px] border border-white/[0.07] bg-[#101010] p-5 sm:rounded-[24px] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
            Bentornato
          </p>

          <h2 className="mt-2 text-[34px] font-black tracking-[-.04em]">
            Accedi al tuo account
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/34">
            Usa Google oppure le credenziali con cui ti sei registrato.
          </p>

          {message && (
            <div className="mt-5 rounded-[13px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm font-semibold text-red-200">
              {message}
            </div>
          )}

          <div className="mt-7 space-y-3.5">
            <button
              onClick={loginWithGoogle}
              className="w-full rounded-[14px] border border-white/[0.09] bg-white px-5 py-3.5 text-sm font-black text-black transition hover:bg-white/90"
            >
              Continua con Google
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/20">
                oppure
              </span>
              <span className="h-px flex-1 bg-white/[0.07]" />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass}
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={fieldClass}
            />

            <label className="flex items-center gap-2.5 py-1 text-xs text-white/35">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="accent-red-600"
              />
              Mostra password
            </label>

            <button
              onClick={loginUser}
              className="w-full rounded-[14px] bg-red-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
            >
              Accedi
            </button>
          </div>

          <div className="mt-7 border-t border-white/[0.07] pt-5 text-center text-sm text-white/35">
            Non hai ancora un account?{" "}
            <Link to="/register" className="font-black text-red-500 hover:text-red-400">
              Registrati
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
