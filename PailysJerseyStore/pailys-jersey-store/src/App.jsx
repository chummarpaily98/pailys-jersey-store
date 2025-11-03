// src/App.jsx
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import "./index.css";
import logo from "./assets/logo.png";
import { Link } from "react-router-dom";

function App() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJersey, setSelectedJersey] = useState(null); // ✅ for modal

  useEffect(() => {
    // Real-time listener (auto-updates on add/delete/change)
    const unsubscribe = onSnapshot(collection(db, "jerseys"), (snapshot) => {
      const jerseyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJerseys(jerseyList);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {/* ===== HEADER ===== */}
      <header className="header">
        <img src={logo} alt="Paily's Jersey Store Logo" className="main-logo" />

        <div className="contact-details">
          <a
            href="https://instagram.com/pailysjerseystore"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <i className="fab fa-instagram"></i>
            <span>@pailysjerseystore</span>
          </a>

          <a
            href="https://wa.me/919947797319"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <i className="fab fa-whatsapp"></i>
            <span>+91 99477 97319</span>
          </a>

          <a
            href="https://reddit.com/u/pailysjerseystore"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <i className="fab fa-reddit"></i>
            <span>u/pailysjerseystore</span>
          </a>
        </div>
      </header>

      {/* ===== JERSEY LIST ===== */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          Loading jerseys...
        </p>
      ) : (
        <section className="jersey-section">
          <div className="jersey-grid">
            {jerseys.map((jersey) => (
              <div
                key={jersey.id}
                className="jersey-card"
                onClick={() => setSelectedJersey(jersey)} // 👈 opens Quick View modal
              >
                <img
                  src={jersey.imageUrl}
                  alt={jersey.name}
                  className="jersey-image"
                />
                <div className="jersey-info">
                  <h3 className="jersey-name">{jersey.name}</h3>
                  <p className="price">₹{jersey.price}</p>
                  <p className="sizes">
                    Sizes: {jersey.sizes?.join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== QUICK VIEW MODAL ===== */}
      {selectedJersey && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedJersey(null)} // closes when clicked outside
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
          >
            <img
              src={selectedJersey.imageUrl}
              alt={selectedJersey.name}
              className="modal-image"
            />
            <button
              className="close-btn"
              onClick={() => setSelectedJersey(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
