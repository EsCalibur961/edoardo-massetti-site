import { useState } from "react"
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"

import { useNavigate } from "react-router-dom"

import { auth } from "../firebase"
import Navbar from "../components/Navbar"

export default function LoginPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  async function loginUser() {
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          form.email,
          form.password
        )

      if (!userCredential.user.emailVerified) {
        await signOut(auth)

        setMessage(
          "Devi prima verificare la tua email."
        )

        return
      }

      navigate("/")
    } catch {
      setMessage("Email o password non corretti.")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6">
        <div className="max-w-xl mx-auto p-8 rounded-[2rem] bg-white text-black">
          <h1 className="text-4xl font-black mb-6">
            Login utenti
          </h1>

          {message && (
            <p className="mb-5 font-bold">
              {message}
            </p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
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
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
            />

            <label className="flex gap-2 text-black/60 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              />
              Mostra password
            </label>

            <button
              onClick={loginUser}
              className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Accedi
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}