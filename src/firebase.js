import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBr_8KqWOQ4DAMsREYsf7cgZhiTEQkOW_U",
  authDomain: "edoardo-massetti-news.firebaseapp.com",
  projectId: "edoardo-massetti-news",
  storageBucket: "edoardo-massetti-news.firebasestorage.app",
  messagingSenderId: "479711372922",
  appId: "1:479711372922:web:a7b6748ca88e7beec87dc3",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)