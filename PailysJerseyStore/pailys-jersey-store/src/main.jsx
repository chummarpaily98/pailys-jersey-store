// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import UploadJersey from "./components/UploadJersey.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./output.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public store */}
        <Route path="/" element={<App />} />

        {/* Admin login route */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected admin upload page */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <UploadJersey />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

/* ================= SPLASH HIDE LOGIC ================= */
/* Runs AFTER React is mounted */
setTimeout(() => {
  const splash = document.getElementById("splash-screen");
  if (splash) {
    splash.classList.add("hide-splash");
    setTimeout(() => splash.remove(), 500);
  }
}, 300);
