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
const MIN_SPLASH_TIME = 1000; // 1 second

const splashStartTime = performance.now();

const hideSplash = () => {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  splash.classList.add("hide-splash");
  setTimeout(() => splash.remove(), 400); // match CSS fadeOut
};

// Ensure splash stays for at least 1 second
requestAnimationFrame(() => {
  const elapsed = performance.now() - splashStartTime;
  const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);

  setTimeout(hideSplash, remaining);
});

