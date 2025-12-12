// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("admin-auth") === "true";

  return isLoggedIn ? children : <Navigate to="/admin-login" />;
}

export default ProtectedRoute;
