// src/components/DisplayJerseys.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const DisplayJerseys = () => {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJerseys = async () => {
      const querySnapshot = await getDocs(collection(db, "jerseys"));
      const jerseysList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJerseys(jerseysList);
      setLoading(false);
    };
    fetchJerseys();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading jerseys...</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "40px",
      }}
    >
      {jerseys.map((jersey) => (
        <div
          key={jersey.id}
          style={{
            background: "#f9f9f9",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <img
            src={jersey.imageUrl}
            alt={jersey.name}
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          />
          <h3>{jersey.name}</h3>
          <p>₹{jersey.price}</p>
          <p
            style={{
              color: jersey.stock === 0 ? "red" : "gray",
              fontWeight: jersey.stock === 0 ? "bold" : "normal",
            }}
          >
            {jersey.stock === 0 ? "Out of Stock" : `Stock: ${jersey.stock}`}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DisplayJerseys;
    