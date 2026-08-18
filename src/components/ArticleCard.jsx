import { Link } from "react-router-dom"

function createCategorySlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function ArticleCard({ article, horizontal = false, compact = false }) {
  const href = `/articolo/${article.slug || article.id}`

  if (horizontal) {
    return (
      <article className="group grid grid-cols-[108px_1fr] gap-4 border-b border-white/[0.06] py-4.5 last:border-b-0 first:pt-0 sm:grid-cols-[116px_1fr]">
        <Link
          to={href}
          className="overflow-hidden rounded-[11px] bg-white/[0.04]"
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-[82px] w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-[82px] place-items-center text-xs font-black text-white/15">
              NEWS
            </div>
          )}
        </Link>

        <div className="min-w-0 self-center">
          {article.category && (
            <Link
              to={`/category/${createCategorySlug(article.category)}`}
              className="text-[9px] font-black uppercase tracking-[.18em] text-red-500"
            >
              {article.category}
            </Link>
          )}

          <Link
            to={href}
            className="mt-1.5 line-clamp-3 block text-[15px] font-extrabold leading-[1.14] tracking-[-.02em] text-white transition group-hover:text-red-400 sm:text-[16px]"
          >
            {article.title}
          </Link>

          {article.publishDate && (
            <p className="mt-2 text-[10px] font-medium text-white/28">
              {article.publishDate}
            </p>
          )}
        </div>
      </article>
    )
  }

  if (compact) {
    return (
      <article className="group border-t border-white/[0.07] pt-5 transition">
        <Link
          to={href}
          className="block aspect-[16/10] overflow-hidden rounded-[16px] bg-white/[0.04]"
        >
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center font-black text-white/10">
              FATTI DIRETTI
            </div>
          )}
        </Link>

        {article.category && (
          <Link
            to={`/category/${createCategorySlug(article.category)}`}
            className="mt-4 inline-block text-[9px] font-black uppercase tracking-[.18em] text-red-500"
          >
            {article.category}
          </Link>
        )}

        <Link
          to={href}
          className="mt-1.5 line-clamp-3 block text-[19px] font-black leading-[1.1] tracking-[-.025em] text-white transition group-hover:text-red-400 md:text-[20px]"
        >
          {article.title}
        </Link>

        <p className="mt-3 text-[10px] text-white/28">
          {article.publishDate || "FattiDiretti"}
        </p>
      </article>
    )
  }

  return (
    <article className="group overflow-hidden rounded-[18px] border border-white/[0.065] bg-[#101010] transition duration-300 hover:-translate-y-1 hover:border-red-500/25 hover:bg-[#121212]">
      <Link
        to={href}
        className="block aspect-[16/10] overflow-hidden bg-white/[0.04]"
      >
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-lg font-black text-white/10">
            FATTI DIRETTI
          </div>
        )}
      </Link>

      <div className="p-5 sm:p-6">
        {article.category && (
          <Link
            to={`/category/${createCategorySlug(article.category)}`}
            className="text-[9px] font-black uppercase tracking-[.18em] text-red-500"
          >
            {article.category}
          </Link>
        )}

        <Link
          to={href}
          className="mt-2 block text-[21px] font-black leading-[1.09] tracking-[-.025em] text-white transition group-hover:text-red-400"
        >
          {article.title}
        </Link>

        {article.description && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-white/43">
            {article.description}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.055] pt-4 text-[10px] text-white/28">
          <span>{article.publishDate || "FattiDiretti"}</span>
          <span className="font-bold text-white/58 transition group-hover:text-red-400">
            Leggi →
          </span>
        </div>
      </div>
    </article>
  )
}
