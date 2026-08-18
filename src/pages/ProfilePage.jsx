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

  const fieldClass =
    "w-full rounded-[14px] border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-[14px] text-white outline-none transition placeholder:text-white/30 focus:border-red-500/45 focus:bg-white/[0.05] disabled:opacity-45"

  if (!user) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="fd-container flex min-h-[calc(100vh-74px)] items-center py-14">
          <div className="mx-auto w-full max-w-xl rounded-[24px] border border-white/[0.07] bg-[#101010] p-7 sm:p-9">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-red-500">
              Area personale
            </p>

            <h1 className="mt-2 text-[36px] font-black tracking-[-.04em]">
              Profilo utente
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/38">
              Devi effettuare il login per visualizzare e gestire il tuo profilo.
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex rounded-full bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-500"
            >
              Vai al login
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <section className="fd-container py-12 md:py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-red-600" />
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">
              Area personale
            </p>
          </div>

          <h1 className="mt-4 text-[44px] font-black leading-none tracking-[-.05em] sm:text-[56px]">
            Il tuo profilo
          </h1>
        </div>

        {message && (
          <div className="mb-7 rounded-[14px] border border-red-500/20 bg-red-500/[0.08] px-5 py-4 text-sm font-semibold text-red-200">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[24px] border border-white/[0.07] bg-[#101010] p-6">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04]">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-3xl font-black text-white/55">
                  FD
                </div>
              )}
            </div>

            <h2 className="mt-5 text-[28px] font-black leading-[1] tracking-[-.035em]">
              {isAdmin
                ? "Edoardo Massetti"
                : profile.displayName || "Utente FattiDiretti"}
            </h2>

            <p className="mt-2 text-sm text-white/32">
              @{profile.username || "username"}
            </p>

            <p className="mt-1 break-all text-xs text-white/24">
              {user.email}
            </p>

            <div className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5 text-sm text-white/45">
              {profile.birthDate && (
                <div className="flex justify-between gap-4">
                  <span className="text-white/22">Nascita</span>
                  <span>{profile.birthDate}</span>
                </div>
              )}

              {profile.city && (
                <div className="flex justify-between gap-4">
                  <span className="text-white/22">Città</span>
                  <span>{profile.city}</span>
                </div>
              )}

              {profile.interests && (
                <div className="pt-2">
                  <p className="text-[9px] font-black uppercase tracking-[.14em] text-red-500">
                    Interessi
                  </p>
                  <p className="mt-2 leading-6 text-white/42">
                    {profile.interests}
                  </p>
                </div>
              )}

              {profile.bio && (
                <div className="pt-2">
                  <p className="text-[9px] font-black uppercase tracking-[.14em] text-red-500">
                    Bio
                  </p>
                  <p className="mt-2 leading-6 text-white/42">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>

            {!isAdmin && (
              <div className="mt-6 rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-[9px] font-black uppercase tracking-[.14em] text-white/24">
                  Verifica email
                </p>
                <p
                  className={`mt-2 text-sm font-black ${
                    user.emailVerified ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {user.emailVerified ? "Email verificata" : "Email non verificata"}
                </p>

                {!user.emailVerified && (
                  <button
                    onClick={resendVerificationEmail}
                    className="mt-3 text-xs font-black text-red-500 hover:text-red-400"
                  >
                    Reinvia verifica →
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2.5">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block w-full rounded-[13px] bg-red-600 px-5 py-3 text-center text-xs font-black text-white transition hover:bg-red-500"
                >
                  Pannello admin
                </Link>
              )}

              <button
                onClick={() => setEditOpen(!editOpen)}
                className="w-full rounded-[13px] border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-xs font-black text-white/70 transition hover:border-red-500/30 hover:text-red-400"
              >
                {editOpen ? "Chiudi modifica" : "Modifica profilo"}
              </button>

              <button
                onClick={activateNotifications}
                className="w-full rounded-[13px] border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-xs font-black text-white/70 transition hover:border-red-500/30 hover:text-red-400"
              >
                Attiva notifiche
              </button>

              <button
                onClick={logoutUser}
                className="w-full rounded-[13px] border border-white/[0.08] px-5 py-3 text-xs font-black text-white/45 transition hover:text-white"
              >
                Logout
              </button>

              {!isAdmin && (
                <button
                  onClick={() => setShowDeleteBox(!showDeleteBox)}
                  className="w-full rounded-[13px] border border-red-500/20 bg-red-500/[0.04] px-5 py-3 text-xs font-black text-red-400 transition hover:bg-red-500/[0.08]"
                >
                  Elimina account
                </button>
              )}
            </div>

            {!isAdmin && showDeleteBox && (
              <div className="mt-4 rounded-[14px] border border-red-500/20 bg-red-500/[0.07] p-4">
                <p className="text-xs font-semibold leading-5 text-red-200/80">
                  Questa azione è definitiva. Il profilo verrà eliminato.
                </p>

                {user.providerData[0]?.providerId === "password" && (
                  <input
                    type="password"
                    placeholder="Inserisci password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={`${fieldClass} mt-3`}
                  />
                )}

                <button
                  onClick={deleteAccount}
                  className="mt-3 w-full rounded-[12px] bg-red-600 px-4 py-3 text-xs font-black text-white"
                >
                  Conferma eliminazione
                </button>
              </div>
            )}
          </aside>

          <section className="min-w-0">
            {editOpen ? (
              <div className="rounded-[24px] border border-white/[0.07] bg-[#101010] p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-red-500">
                  Modifica
                </p>

                <h2 className="mt-2 text-[30px] font-black tracking-[-.04em]">
                  Aggiorna il profilo
                </h2>

                <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
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
                    className={fieldClass}
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
                    className={fieldClass}
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
                    className={fieldClass}
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
                    className={fieldClass}
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
                    className={`${fieldClass} sm:col-span-2`}
                  />

                  <label className="cursor-pointer rounded-[14px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5 sm:col-span-2">
                    <p className="text-sm font-black">Foto profilo</p>
                    <p className="mt-1 text-xs text-white/28">
                      Seleziona una nuova immagine dal dispositivo.
                    </p>
                    <p className="mt-3 truncate text-xs font-semibold text-white/50">
                      {avatarFile?.name || "Scegli file"}
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

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
                    className={`${fieldClass} resize-none sm:col-span-2`}
                  />
                </div>

                <button
                  onClick={saveProfile}
                  className="mt-6 rounded-[14px] bg-red-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-red-500"
                >
                  Salva profilo
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/[0.07] bg-[#101010] p-6">
                  <p className="text-[9px] font-black uppercase tracking-[.17em] text-red-500">
                    Account
                  </p>
                  <h3 className="mt-3 text-[22px] font-black tracking-[-.03em]">
                    Profilo attivo
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/34">
                    Le informazioni del tuo profilo sono visibili qui e possono
                    essere aggiornate in qualsiasi momento.
                  </p>
                </div>

                <div className="rounded-[20px] border border-white/[0.07] bg-[#101010] p-6">
                  <p className="text-[9px] font-black uppercase tracking-[.17em] text-red-500">
                    Notifiche
                  </p>
                  <h3 className="mt-3 text-[22px] font-black tracking-[-.03em]">
                    Resta aggiornato
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/34">
                    Puoi abilitare le notifiche dal pannello a sinistra per ricevere
                    gli aggiornamenti supportati dal sito.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
