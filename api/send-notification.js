import admin from "firebase-admin"

function getAdminApp() {
  if (admin.apps.length) {
    return admin.app()
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = Buffer.from(
  process.env.FIREBASE_PRIVATE_KEY_BASE64,
  "base64"
).toString("utf8")

console.log({
  projectIdExists: !!projectId,
  clientEmailExists: !!clientEmail,
  privateKeyExists: !!privateKey,
})
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Variabili Firebase mancanti su Vercel")
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Metodo non consentito",
    })
  }

  try {
    getAdminApp()

    const db = admin.firestore()

    const { title, body, link } = req.body

    const snapshot = await db.collection("notificationTokens").get()

    const tokens = snapshot.docs
      .map((doc) => doc.data().token)
      .filter(Boolean)

    if (tokens.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Nessun token trovato",
      })
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: title || "FattiDiretti",
        body: body || "Nuovo contenuto disponibile",
      },
      webpush: {
        notification: {
          icon: "https://www.fattidiretti.com/favicon.png",
        },
        fcmOptions: {
          link: link
            ? `https://www.fattidiretti.com${link}`
            : "https://www.fattidiretti.com",
        },
      },
    })

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    })
  } catch (error) {
    console.error("ERRORE API NOTIFICHE:", error)

    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}