import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import ArticlePage from "./pages/ArticlePage"
import PodcastPage from "./pages/PodcastPage"
import ArticlesPage from "./pages/ArticlesPage"
import PodcastsPage from "./pages/PodcastsPage"
import CategoryPage from "./pages/CategoryPage"
import AdminPage from "./pages/AdminPage"
import SearchPage from "./pages/SearchPage"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import CompleteProfilePage from "./pages/CompleteProfilePage"

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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}