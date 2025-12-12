// src/components/UploadJersey.jsx
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ─────────────────────────────────────────────
   MAIN COMPONENT
─────────────────────────────────────────────── */
export default function UploadJersey() {
  /* ---------------- SINGLE UPLOAD STATES ---------------- */
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [singleProgress, setSingleProgress] = useState(0);
  const [singleMessage, setSingleMessage] = useState("");

  /* ---------------- BULK UPLOAD STATES ---------------- */
  const [excelFile, setExcelFile] = useState(null);
  const [bulkImages, setBulkImages] = useState([]);
  const [excelRows, setExcelRows] = useState([]);
  const [missingImages, setMissingImages] = useState([]);

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [progressCards, setProgressCards] = useState([]); // array of { imageName, status, progress }
  const [bulkResults, setBulkResults] = useState(null);

  /* ─────────────────────────────────────────────
      LOGOUT
  ────────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    window.location.href = "/admin-login";
  };

  /* ─────────────────────────────────────────────
      SINGLE UPLOAD
  ────────────────────────────────────────────── */
  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Select image");

    setSingleProgress(0);
    setSingleMessage("");

    const fileRef = ref(
      storage,
      `jerseys/${Date.now()}_${image.name.replace(/\s+/g, "_")}`
    );

    const uploadTask = uploadBytesResumable(fileRef, image);

    uploadTask.on(
      "state_changed",
      (snap) => {
        setSingleProgress(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        );
      },
      (err) => alert("Upload failed" + err),
      async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(db, "jerseys"), {
          name,
          price: Number(price),
          stock: Number(stock),
          sizes: [],
          imageUrl,
          createdAt: new Date(),
        });

        setSingleMessage("Uploaded successfully!");
        setName("");
        setPrice("");
        setStock("");
        setImage(null);
        setSingleProgress(0);
      }
    );
  };

  /* ─────────────────────────────────────────────
      READ EXCEL → DETECT MISSING IMAGES
  ────────────────────────────────────────────── */
  useEffect(() => {
    if (!excelFile) return;

    const readExcel = async () => {
      const buf = await excelFile.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      setExcelRows(rows);

      const providedFiles = bulkImages.map((f) => f.name.trim());
      const missing = [];

      rows.forEach((row) => {
        const nameCell =
          row.imageName || row.ImageName || row.image || row.Image || "";
        if (nameCell && !providedFiles.includes(nameCell.trim())) {
          missing.push(nameCell.trim());
        }
      });

      setMissingImages(missing);
    };

    readExcel();
  }, [excelFile, bulkImages]);

  /* ─────────────────────────────────────────────
      BULK UPLOAD → SAFE PIPELINE (with rollback)
  ────────────────────────────────────────────── */
  const uploadRowSafely = async (row, cardIndex) => {
    const imageName =
      row.imageName || row.ImageName || row.image || row.Image || "";

    const imageFile = bulkImages.find(
      (f) => f.name.trim() === imageName.trim()
    );

    if (!imageFile) {
      updateCard(cardIndex, "❌ Missing image file", 0);
      return {
        ...row,
        status: "ERROR",
        uploadedImageUrl: "",
        errorMessage: "Missing image file",
      };
    }

    /* Step 1 → Upload image */
    updateCard(cardIndex, "Uploading image…", 5);
    let imageRef = null;
    let downloadURL = "";

    try {
      const fileRef = ref(
        storage,
        `jerseys/${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`
      );
      imageRef = fileRef;

      const task = uploadBytesResumable(fileRef, imageFile);

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const p = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            updateCard(cardIndex, "Uploading image…", p);
          },
          reject,
          resolve
        );
      });

      downloadURL = await getDownloadURL(task.snapshot.ref);
    } catch (err) {
      updateCard(cardIndex, "❌ Image upload failed", 100);
      return {
        ...row,
        status: "ERROR",
        uploadedImageUrl: "",
        errorMessage: "Image upload failed",
      };
    }

    /* Step 2 → Insert Firestore */
    updateCard(cardIndex, "Saving jersey to database…", 80);

    try {
      const sizes = String(row.sizes || row.Sizes || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await addDoc(collection(db, "jerseys"), {
        name: row.name || row.Name,
        price: Number(row.price || row.Price || 0),
        stock: Number(row.stock || row.Stock || 0),
        sizes,
        imageUrl: downloadURL,
        createdAt: new Date(),
      });

      updateCard(cardIndex, "✅ Completed", 100);

      return {
        ...row,
        status: "OK",
        uploadedImageUrl: downloadURL,
        errorMessage: "",
      };
    } catch (err) {
      /* ROLLBACK → delete uploaded image */
      if (imageRef) await deleteObject(imageRef);

      updateCard(cardIndex, "❌ Database failed — rolled back", 100);

      return {
        ...row,
        status: "ERROR",
        uploadedImageUrl: "",
        errorMessage: "Database insert failed — rollback successful",
      };
    }
  };

  /* Update card UI */
  const updateCard = (index, status, progress) => {
    setProgressCards((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        status,
        progress,
      };
      return copy;
    });
  };

  /* Start bulk upload */
  const startBulkUpload = async () => {
    setBulkModalOpen(true);
    setUploading(true);
    setBulkResults(null);

    const cards = excelRows.map((row) => ({
      imageName:
        row.imageName || row.ImageName || row.image || row.Image || "unknown",
      status: "Waiting…",
      progress: 0,
    }));
    setProgressCards(cards);

    const results = [];

    for (let i = 0; i < excelRows.length; i++) {
      const res = await uploadRowSafely(excelRows[i], i);
      results.push(res);
    }

    /* Generate updated Excel */
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "results");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      "bulk-upload-results.xlsx"
    );

    setBulkResults(results);
    setUploading(false);
  };

  /* ─────────────────────────────────────────────
      UI RENDER
  ────────────────────────────────────────────── */

  return (
    <div
      style={{
        margin: "50px auto",
        maxWidth: "720px",
        padding: "30px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          background: "#c41e3a",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* -------------------- SINGLE UPLOAD -------------------- */}
      <h2 style={{ color: "#154E39" }}>Upload Jersey (Single)</h2>

      <form onSubmit={handleSingleUpload}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={input}
          required
        />
        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={input}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={input}
          required
        />

        <button style={button}>Upload</button>
      </form>

      {singleProgress > 0 && <p>Progress: {singleProgress}%</p>}
      {singleMessage && <p style={{ color: "green" }}>{singleMessage}</p>}

      <hr style={{ margin: "30px 0" }} />

      {/* -------------------- BULK UPLOAD -------------------- */}
      <h2 style={{ color: "#154E39" }}>Bulk Upload (Excel + Images)</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setExcelFile(e.target.files[0] || null)}
        style={input}
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setBulkImages([...e.target.files])}
        style={input}
      />

      {/* Missing images preview */}
      {missingImages.length > 0 && (
        <div
          style={{
            background: "#ffe5e5",
            padding: "10px",
            borderRadius: "8px",
            margin: "10px 0",
            color: "#b30000",
          }}
        >
          <strong>Missing images:</strong>
          {missingImages.map((m) => (
            <div key={m}>❌ {m}</div>
          ))}
        </div>
      )}

      <button
        disabled={missingImages.length > 0 || !excelFile}
        onClick={startBulkUpload}
        style={{
          ...button,
          opacity: missingImages.length > 0 ? 0.5 : 1,
        }}
      >
        Start Bulk Upload
      </button>

      {/* -------------------- PREMIUM MODAL -------------------- */}
      {bulkModalOpen && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ color: "#fff", marginBottom: "10px" }}>
              Bulk Upload Progress
            </h2>

            <div style={progressList}>
              {progressCards.map((card, idx) => (
                <div key={idx} style={glassCard}>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>
                    {card.imageName}
                  </div>

                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "rgba(255,255,255,0.2)",
                      marginTop: "8px",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${card.progress}%`,
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #4ef38b, #2fbb66)",
                        transition: "0.2s",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      color: "white",
                      marginTop: "6px",
                      fontSize: "14px",
                      opacity: 0.9,
                    }}
                  >
                    {card.status}
                  </div>
                </div>
              ))}
            </div>

            {!uploading && (
              <button
                onClick={() => setBulkModalOpen(false)}
                style={{
                  marginTop: "20px",
                  background: "#fff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
─────────────────────────────────────────────── */

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  background: "#154E39",
  color: "white",
  border: "none",
  cursor: "pointer",
  marginTop: "5px",
};

const modalOverlay = {
  position: "fixed",
  zIndex: 1000,
  inset: 0,
  backdropFilter: "blur(10px)",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  width: "600px",
  maxHeight: "80vh",
  overflowY: "auto",
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.08)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.2)",
};

const progressList = {
  maxHeight: "60vh",
  overflowY: "auto",
  paddingRight: "10px",
};

const glassCard = {
  padding: "15px",
  marginBottom: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
};
