import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import ArticlePage from "./pages/ArticlePage"
import AdminPage from "./pages/AdminPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
