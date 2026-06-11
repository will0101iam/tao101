import { Navigate, Route, Routes } from "react-router-dom";
import AdminGuard from "@/components/admin/AdminGuard";
import Home from "@/pages/Home";
import ProcessPage from "@/pages/ProcessPage";
import Post from "@/pages/Post";
import Product from "@/pages/Product";
import AdminLayout from "@/pages/admin/AdminLayout";
import Login from "@/pages/admin/Login";
import PostList from "@/pages/admin/PostList";
import ProductList from "@/pages/admin/ProductList";
import SettingsPage from "@/pages/admin/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/post/:id" element={<Post />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/process" element={<ProcessPage />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Navigate replace to="/admin/posts" />} />
        <Route path="posts" element={<PostList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
