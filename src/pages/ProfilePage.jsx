import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Link } from "react-router-dom"

import { auth, db, storage } from "../firebase"
import Navbar from "../components/Navbar"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)

  const [profile, setProfile] = useState({
    displayName: "",
    username: "",
    bio: "",
    city: "",
    interests: "",
    avatarUrl: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        const profileRef = doc(db, "users", currentUser.uid)
        const profileSnap = await getDoc(profileRef)

        if (profileSnap.exists()) {
          setProfile(profileSnap.data())
        }
      }
    })

    return () => unsubscribe()
  }, [])

  async function uploadAvatar() {
    if (!user || !avatarFile) return profile.avatarUrl

    setMessage("Caricamento immagine in corso...")

    const safeName = avatarFile.name.replaceAll(" ", "-")
    const avatarRef = ref(
      storage,
      `avatars/${user.uid}/${Date.now()}-${safeName}`
    )

    await uploadBytes(avatarRef, avatarFile)
    const downloadUrl = await getDownloadURL(avatarRef)

    return downloadUrl
  }

  async function saveProfile() {
    if (!user) return

    try {
      const finalAvatarUrl = avatarFile
        ? await uploadAvatar()
        : profile.avatarUrl

      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profile,
          avatarUrl: finalAvatarUrl,
          email: user.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setProfile({
        ...profile,
        avatarUrl: finalAvatarUrl,
      })

      setAvatarFile(null)
      setMessage("Profilo aggiornato correttamente.")
    } catch (error) {
      setMessage("Errore caricamento immagine: " + error.message)
    }
  }

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
            <h1 className="text-4xl font-black mb-6">Profilo utente</h1>

            <p className="text-black/60 mb-6">
              Devi effettuare il login per vedere il tuo profilo.
            </p>

            <Link
              to="/login"
              className="inline-block px-8 py-4 rounded-full bg-black text-white font-black"
            >
              Vai al login
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="pt-40 px-6 pb-28">
        <div className="max-w-5xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
            Area personale
          </p>

          <h1 className="text-5xl md:text-7xl font-black mt-4 mb-10">
            Profilo utente
          </h1>

          {message && <p className="mb-8 text-white/70 font-bold">{message}</p>}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-white text-black">
              <div className="w-32 h-32 rounded-full bg-black/10 overflow-hidden mb-6">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black">
                    FD
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black">
                {profile.displayName || "Utente FattiDiretti"}
              </h2>

              <p className="text-black/50 mt-2">{user.email}</p>

              <div className="mt-8 space-y-5">
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

                {!user.emailVerified && (
                  <button
                    onClick={resendVerificationEmail}
                    className="w-full px-6 py-4 rounded-full bg-black text-white font-black"
                  >
                    Reinvia verifica
                  </button>
                )}

                <button
                  onClick={logoutUser}
                  className="w-full px-6 py-4 rounded-full border border-black/20 text-black font-black"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white text-black">
              <h2 className="text-3xl font-black mb-6">Modifica profilo</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome visualizzato"
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <input
                  type="text"
                  placeholder="Città"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <input
                  type="text"
                  placeholder="Interessi"
                  value={profile.interests}
                  onChange={(e) =>
                    setProfile({ ...profile, interests: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                />

                <div>
                  <p className="font-bold mb-2">
                    Carica foto profilo dal dispositivo
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />
                </div>

                <textarea
                  rows="5"
                  placeholder="Bio personale"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none resize-none"
                />

                <button
                  onClick={saveProfile}
                  className="w-full px-8 py-4 rounded-full bg-black text-white font-black"
                >
                  Salva profilo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}