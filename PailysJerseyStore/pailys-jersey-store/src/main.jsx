// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import UploadJersey from "./components/UploadJersey.jsx";
import "./output.css"; // ✅ keep your existing CSS import

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 🏪 Main store page */}
        <Route path="/" element={<App />} />

        {/* ⚙️ Admin upload page */}
        <Route path="/admin" element={<UploadJersey />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
