import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from "firebase/auth"
import { auth } from "../firebase"

import Navbar from "../components/Navbar"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  async function logoutUser() {
    await signOut(auth)
    setMessage("Logout effettuato.")
  }

  async function resendVerificationEmail() {
    try {
      if (!user) return

      await sendEmailVerification(user)
      setMessage("Email di verifica inviata di nuovo.")
    } catch {
      setMessage("Errore durante l'invio della verifica email.")
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />

        <section className="pt-40 px-6">
          <div className="max-w-xl mx-auto p-8 rounded-[2rem] bg-white text-black">
            <h1 className="text-4xl font-black mb-6">
              Profilo utente
            </h1>

            <p className="text-black/60 mb-6">
              Devi effettuare il login per vedere il tuo profilo.
            </p>

            <a
              href="/login"
              className="inline-block px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Vai al login
            </a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
            Area personale
          </p>

          <h1 className="text-5xl md:text-7xl font-black mt-4 mb-10">
            Profilo utente
          </h1>

          {message && (
            <p className="mb-8 text-white/70 font-bold">
              {message}
            </p>
          )}

          <div className="p-8 rounded-[2rem] bg-white text-black">
            <div className="space-y-6">
              <div>
                <p className="text-black/40 font-bold uppercase text-sm">
                  Email
                </p>

                <p className="text-2xl font-black mt-2">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-black/40 font-bold uppercase text-sm">
                  Verifica email
                </p>

                <p
                  className={`text-2xl font-black mt-2 ${
                    user.emailVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.emailVerified ? "Verificata" : "Non verificata"}
                </p>
              </div>

              <div>
                <p className="text-black/40 font-bold uppercase text-sm">
                  ID utente
                </p>

                <p className="text-sm text-black/50 break-all mt-2">
                  {user.uid}
                </p>
              </div>

              {!user.emailVerified && (
                <button
                  onClick={resendVerificationEmail}
                  className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                >
                  Reinvia email di verifica
                </button>
              )}

              <button
                onClick={logoutUser}
                className="w-full px-8 py-4 rounded-full border border-black/20 text-black font-black"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}