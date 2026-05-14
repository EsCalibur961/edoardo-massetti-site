import { useState } from "react"
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "../firebase"

export default function RegisterBox() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [message, setMessage] = useState("")

  async function registerUser() {
    try {
      setMessage("")

      if (!form.email || !form.password) {
        setMessage("Inserisci email e password.")
        return
      }

      if (form.password.length < 6) {
        setMessage("La password deve avere almeno 6 caratteri.")
        return
      }

      await createUserWithEmailAndPassword(auth, form.email, form.password)
      await signOut(auth)

      setForm({ email: "", password: "" })
      setMessage("Registrazione completata. Non è obbligatoria, ma ti permette di seguire gli aggiornamenti.")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setMessage("Questa email è già registrata.")
      } else {
        setMessage("Errore durante la registrazione.")
      }
    }
  }

  return (
    <section id="register" className="px-6 py-24 bg-white text-black">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="uppercase tracking-[0.35em] text-black/40 text-sm">
            Community
          </p>

          <h2 className="text-5xl md:text-7xl font-black mt-4 mb-8">
            Registrazione facoltativa.
          </h2>

          <p className="text-xl text-black/60 leading-relaxed">
            Gli utenti possono registrarsi per ricevere aggiornamenti, contenuti extra,
            podcast e futuri contenuti premium. La registrazione non è obbligatoria
            per leggere il sito.
          </p>
        </div>

        <div className="p-8 rounded-[2rem] bg-black text-white">
          <h3 className="text-3xl font-black mb-6">Crea account</h3>

          {message && (
            <p className="mb-5 text-white/70 font-bold">
              {message}
            </p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
            />

            <input
              type="password"
              placeholder="Password almeno 6 caratteri"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
  )
}
