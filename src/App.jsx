import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import ArticlePage from "./pages/ArticlePage"
import PodcastPage from "./pages/PodcastPage"
import ArticlesPage from "./pages/ArticlesPage"
import PodcastsPage from "./pages/PodcastsPage"
import CategoryPage from "./pages/CategoryPage"
import AdminPage from "./pages/AdminPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/podcast/:slug" element={<PodcastPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}