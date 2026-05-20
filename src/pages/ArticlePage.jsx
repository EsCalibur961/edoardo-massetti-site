<main className="min-h-screen bg-black text-white">
  <Navbar />

  <section className="pt-32 md:pt-40 px-4 md:px-6 pb-24">
    <div className="max-w-5xl mx-auto">

      <p className="uppercase tracking-[0.3em] text-white/40 text-xs md:text-sm mb-5">
        {article.category}
      </p>

      <h1 className="text-4xl md:text-7xl font-black leading-none mb-8">
        {article.title}
      </h1>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-[300px] md:h-[700px] object-cover rounded-[2rem] mb-10"
        />
      )}

      <p className="text-white/40 mb-10 text-sm">
        {article.publishDate}
      </p>

      <div
        className="
          text-white/80
          leading-[2]
          text-base
          md:text-xl
          space-y-6
          prose
          prose-invert
          max-w-none
        "
        dangerouslySetInnerHTML={{
          __html: article.content,
        }}
      />

    </div>
  </section>
</main>