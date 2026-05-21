import admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  })
}

const db = admin.firestore()

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" })
  }

  try {
    const { title, body, link } = req.body

    const snapshot = await db.collection("notificationTokens").get()

    const tokens = snapshot.docs
      .map((doc) => doc.data().token)
      .filter(Boolean)

    if (tokens.length === 0) {
      return res.status(200).json({ success: false, message: "Nessun token" })
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: "/favicon.png",
        },
        fcmOptions: {
          link: link || "/",
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