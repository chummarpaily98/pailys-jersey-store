// src/components/UploadJersey.jsx
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const UploadJersey = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState("");
  const [newSize, setNewSize] = useState("");
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.toUpperCase())) {
      setSizes([...sizes, newSize.toUpperCase()]);
      setNewSize("");
    }
  };

  const removeSize = (size) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please select an image!");

    const storageRef = ref(storage, `jerseys/${Date.now()}_${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Image upload failed!");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(db, "jerseys"), {
          name,
          price: Number(price),
          sizes, // ✅ array of strings like ["S", "M", "L"]
          stock: Number(stock),
          imageUrl: downloadURL,
          createdAt: new Date(),
        });

        setMessage("✅ Jersey uploaded successfully!");
        setName("");
        setPrice("");
        setSizes([]);
        setStock("");
        setImage(null);
        setProgress(0);
      }
    );
  };

  return (
    <div
      style={{
        margin: "50px auto",
        maxWidth: "450px",
        textAlign: "center",
        backgroundColor: "#f8f8f8",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#154E39", marginBottom: "20px" }}>
        Upload New Jersey
      </h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Jersey Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={inputStyle}
        />

        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ color: "#333" }}>Sizes</h4>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Add Size (e.g. S)"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              style={{ ...inputStyle, width: "60%" }}
            />
            <button
              type="button"
              onClick={addSize}
              style={{
                backgroundColor: "#c41e3a",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
            {sizes.map((size) => (
              <span
                key={size}
                style={{
                  display: "inline-block",
                  backgroundColor: "#154E39",
                  color: "white",
                  padding: "5px 10px",
                  margin: "5px",
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
                onClick={() => removeSize(size)}
              >
                {size} ✕
              </span>
            ))}
          </div>
        </div>

        <input
          type="number"
          placeholder="Total Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#154E39",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Upload Jersey
        </button>
      </form>

      {progress > 0 && (
        <div style={{ marginTop: "10px" }}>
          Upload Progress: {Math.round(progress)}%
        </div>
      )}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

export default UploadJersey;
