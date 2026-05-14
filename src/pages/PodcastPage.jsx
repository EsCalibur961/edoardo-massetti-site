import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { Helmet } from "react-helmet-async"
import { db } from "../firebase"

import Navbar from "../components/Navbar"

export default function PodcastPage() {
  const { slug } = useParams()
  const [podcast, setPodcast] = useState(null)

  useEffect(() => {
    async function loadPodcast() {
      const data = await getDocs(collection(db, "podcasts"))

      const found = data.docs.find((item) => item.data().slug === slug)

      if (found) {
        setPodcast(found.data())
      }
    }

    loadPodcast()
  }, [slug])

  if (!podcast) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Podcast non trovato...
      </main>
    )
  }

  return (
    <>
      <Helmet>
        <title>{podcast.seoTitle || podcast.title}</title>
        <meta
          name="description"
          content={podcast.seoDescription || podcast.description}
        />
      </Helmet>

      <main className="min-h-screen bg-[#080808] text-white">
        <Navbar />

        <section className="pt-36 px-6 pb-28">
          <div className="max-w-5xl mx-auto">
            <p className="uppercase tracking-[0.25em] text-white/40 text-sm mb-6">
              {podcast.category}
            </p>

            <h1 className="text-6xl md:text-8xl font-black mb-8">
              {podcast.title}
            </h1>

            <p className="text-white/40 mb-10">{podcast.publishDate}</p>

            {podcast.videoUrl && (
              <div className="aspect-video rounded-[2rem] overflow-hidden bg-black mb-10">
                <iframe
                  src={podcast.videoUrl}
                  title={podcast.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <p className="text-xl text-white/60 mb-10">
              {podcast.description}
            </p>

            <div
              className="text-xl leading-relaxed text-white/80"
              dangerouslySetInnerHTML={{
                __html: podcast.content,
              }}
            />
          </div>
        </section>
      </main>
    </>
  )
}