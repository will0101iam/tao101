import { Navigate, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import ProcessPage from "@/pages/ProcessPage";
import Post from "@/pages/Post";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/post/:id" element={<Post />} />
      <Route path="/process" element={<ProcessPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
