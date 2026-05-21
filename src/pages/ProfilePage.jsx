import { getToken } from "firebase/messaging"
import { messaging } from "../firebase"
import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Link, useNavigate } from "react-router-dom"
import { auth, db, storage } from "../firebase"
import Navbar from "../components/Navbar"

export default function ProfilePage() {
  async function activateNotifications() {
  try {
    if (!user) return

    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      setMessage("Notifiche non autorizzate.")
      return
    }

    const token = await getToken(messaging, {
      vapidKey: "BKRSDzoif6Vw2684XBzQrySTq1SNuWXV8PX_V7GZBO_DjArwDkE0hJ7BCmE2MWy4A0CWG_NLsYPPOWpxDVc2zQg",
    })

    await setDoc(
      doc(db, "notificationTokens", user.uid),
      {
        userId: user.uid,
        email: user.email,
        token,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    setMessage("Notifiche attivate correttamente.")
  } catch (error) {
    setMessage("Errore notifiche: " + error.message)
  }
}
  const navigate = useNavigate()
  const ADMIN_EMAIL = "massetti.edoardo@libero.it"

  const [user, setUser] = useState(null)
  const [message, setMessage] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [showDeleteBox, setShowDeleteBox] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  const [profile, setProfile] = useState({
    displayName: "",
    username: "",
    bio: "",
    city: "",
    interests: "",
    avatarUrl: "",
    birthDate: "",
  })

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        const profileRef = doc(db, "users", currentUser.uid)
        const profileSnap = await getDoc(profileRef)

        if (profileSnap.exists()) {
          setProfile({
            displayName:
              currentUser.email === ADMIN_EMAIL
                ? "Edoardo Massetti"
                : profileSnap.data().displayName || "",
            username: profileSnap.data().username || "",
            bio: profileSnap.data().bio || "",
            city: profileSnap.data().city || "",
            interests: profileSnap.data().interests || "",
            avatarUrl: profileSnap.data().avatarUrl || "",
            birthDate: profileSnap.data().birthDate || "",
          })
        } else if (currentUser.email === ADMIN_EMAIL) {
          setProfile({
            displayName: "Edoardo Massetti",
            username: "edoardo",
            bio: "",
            city: "",
            interests: "",
            avatarUrl: "",
            birthDate: "",
          })
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

    return await getDownloadURL(avatarRef)
  }

  async function saveProfile() {
    if (!user) return

    try {
      const finalAvatarUrl = avatarFile
        ? await uploadAvatar()
        : profile.avatarUrl

      const finalDisplayName = isAdmin
        ? "Edoardo Massetti"
        : profile.displayName

      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profile,
          displayName: finalDisplayName,
          avatarUrl: finalAvatarUrl,
          email: user.email,
          profileCompleted: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setProfile({
        ...profile,
        displayName: finalDisplayName,
        avatarUrl: finalAvatarUrl,
      })

      setAvatarFile(null)
      setMessage("Profilo aggiornato correttamente.")
      setEditOpen(false)
    } catch (error) {
      setMessage("Errore caricamento immagine: " + error.message)
    }
  }

  async function logoutUser() {
    await signOut(auth)
    navigate("/")
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

  async function deleteAccount() {
    try {
      if (!user) return

      if (isAdmin) {
        setMessage("L'account admin non può essere eliminato da qui.")
        return
      }

      const providerId = user.providerData[0]?.providerId

      if (providerId === "password") {
        if (!deletePassword) {
          setMessage("Inserisci la password per eliminare l'account.")
          return
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          deletePassword
        )

        await reauthenticateWithCredential(user, credential)
      }

      await deleteDoc(doc(db, "users", user.uid))
      await deleteUser(user)

      navigate("/")
    } catch {
      setMessage(
        "Errore eliminazione account. Effettua di nuovo il login e riprova."
      )
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
                {isAdmin
                  ? "Edoardo Massetti"
                  : profile.displayName || "Utente FattiDiretti"}
              </h2>

              <p className="text-black/50 mt-2">
                @{profile.username || "username"}
              </p>

              <p className="text-black/50 mt-2">{user.email}</p>

              {profile.birthDate && (
                <p className="mt-4 text-black/70">🎂 {profile.birthDate}</p>
              )}

              {profile.city && (
                <p className="mt-2 text-black/70">📍 {profile.city}</p>
              )}

              {profile.interests && (
                <p className="mt-2 text-black/70">🎯 {profile.interests}</p>
              )}

              {profile.bio && (
                <p className="mt-6 text-black/70 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="mt-8 space-y-5">
                {!isAdmin && (
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
                )}

                {!isAdmin && !user.emailVerified && (
                  <button
                    onClick={resendVerificationEmail}
                    className="w-full px-6 py-4 rounded-full bg-black text-white font-black"
                  >
                    Reinvia verifica
                  </button>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block w-full px-6 py-4 rounded-full bg-red-600 text-white font-black text-center"
                  >
                    Vai al pannello admin
                  </Link>
                )}

                <button
                  onClick={() => setEditOpen(!editOpen)}
                  className="w-full px-6 py-4 rounded-full bg-black text-white font-black"
                >
                  {editOpen ? "Chiudi modifica" : "Modifica profilo"}
                </button>
                <button
  onClick={activateNotifications}
  className="w-full px-6 py-4 rounded-full bg-black text-white font-black"
>
  Attiva notifiche
</button>

                <button
                  onClick={logoutUser}
                  className="w-full px-6 py-4 rounded-full border border-black/20 text-black font-black"
                >
                  Logout
                </button>

                {!isAdmin && (
                  <button
                    onClick={() => setShowDeleteBox(!showDeleteBox)}
                    className="w-full px-6 py-4 rounded-full border border-red-500 text-red-600 font-black"
                  >
                    Elimina account
                  </button>
                )}

                {!isAdmin && showDeleteBox && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                    <p className="text-red-700 font-bold mb-4">
                      Questa azione è definitiva. Il profilo verrà eliminato.
                    </p>

                    {user.providerData[0]?.providerId === "password" && (
                      <input
                        type="password"
                        placeholder="Inserisci password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-red-200 outline-none mb-4"
                      />
                    )}

                    <button
                      onClick={deleteAccount}
                      className="w-full px-6 py-4 rounded-full bg-red-600 text-white font-black"
                    >
                      Conferma eliminazione account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editOpen && (
              <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white text-black">
                <h2 className="text-3xl font-black mb-6">
                  Modifica profilo
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome visualizzato"
                    value={isAdmin ? "Edoardo Massetti" : profile.displayName}
                    disabled={isAdmin}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Username"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        birthDate: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Città"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Interessi"
                    value={profile.interests}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        interests: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-black/10 outline-none"
                  />

                  <div>
                    <p className="font-bold mb-2">Carica foto profilo</p>

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
                      setProfile({
                        ...profile,
                        bio: e.target.value,
                      })
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
            )}
          </div>
        </div>
      </section>
    </main>
  )
}