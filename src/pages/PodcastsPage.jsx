import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import { db } from "../firebase"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState([])

  useEffect(() => {
    async function loadPodcasts() {
      const data = await getDocs(collection(db, "podcasts"))
      setPodcasts(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }

    loadPodcasts()
  }, [])

  return (
    <>
      <Helmet>
        <title>Tutti i podcast | FattiDiretti</title>
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <p className="uppercase tracking-[0.35em] text-white/40 text-sm">
              Video Podcast
            </p>

            <h1 className="text-6xl md:text-8xl font-black mt-4">
              Tutti i podcast
            </h1>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {podcasts.map((podcast) => (
              <Link
                key={podcast.id}
                to={`/podcast/${podcast.slug}`}
                className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                {podcast.coverImage && (
                  <img
                    src={podcast.coverImage}
                    alt={podcast.title}
                    className="w-full aspect-video object-cover"
                  />
                )}

                <div className="p-7">
                  <p className="uppercase tracking-[0.25em] text-white/40 text-xs mb-4">
                    {podcast.category}
                  </p>

                  <h3 className="text-3xl font-black mb-5">
                    {podcast.title}
                  </h3>

                  <p className="text-white/50">{podcast.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}