export default function PodcastCard({ podcast }) {
  return (
    <div className="rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition">
      {podcast.image && (
        <img
          src={podcast.image}
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

        <p className="text-white/50 mb-8">
          {podcast.description || podcast.desc}
        </p>

        {podcast.videoUrl && (
          <a
            href={podcast.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-6 py-3 rounded-full bg-white text-black font-black"
          >
            Guarda episodio
          </a>
        )}
      </div>
    </div>
  )
}
