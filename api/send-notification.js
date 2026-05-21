import admin from "firebase-admin"

function formatPrivateKey(key) {
  return key?.replace(/\\n/g, "\n")
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  })
}

const db = admin.firestore()

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" })
  }

  try {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      return res.status(500).json({
        success: false,
        error: "Variabili Firebase mancanti su Vercel",
      })
    }

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
        title,
        body,
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
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}