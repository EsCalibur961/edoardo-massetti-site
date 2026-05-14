import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function ArticleCard({ article }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-black text-white rounded-[2rem] overflow-hidden"
    >
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-72 object-cover"
        />
      )}

      <div className="p-8">
        <p className="uppercase text-xs tracking-[0.25em] text-white/40 mb-4">
          {article.category}
        </p>

        <h2 className="text-3xl font-black mb-4">
          {article.title}
        </h2>

        <p className="text-white/50 mb-6">
          {article.description}
        </p>

        <Link
          to={`/article/${article.id}`}
          className="inline-block px-6 py-3 rounded-full bg-white text-black font-bold"
        >
          Leggi articolo
        </Link>
      </div>
    </motion.div>
  )
}