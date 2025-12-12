// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import UploadJersey from "./components/UploadJersey.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./output.css";

ReactDOM.createRoot(document.getElementById("root")).render(
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
