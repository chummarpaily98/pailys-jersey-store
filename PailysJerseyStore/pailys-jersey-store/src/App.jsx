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
  const [showFilter, setShowFilter] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);

  const [showSizePanel, setShowSizePanel] = useState(false);
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [filteredJerseys, setFilteredJerseys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const filtersActive =
    selectedSizes.length > 0 ||
    selectedTeams.length > 0;
  const displayCount = filtersActive
    ? filteredJerseys.length
    : jerseys.length;
  const [showSearch, setShowSearch] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [itemsPerPage] = useState(10);
  const [visibleCount, setVisibleCount] = useState(10);





  // ===================
  // STEP 2 — Toggle selection helpers
  // ===================
  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleTeam = (team) => {
    setSelectedTeams(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };
  const loadMore = () => {
    setVisibleCount(prev => prev + itemsPerPage);
  };
  const activeList =
    filteredJerseys.length > 0 || filtersActive || searchText.trim() !== ""
      ? filteredJerseys
      : jerseys;






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

  useEffect(() => {
    if (!jerseys || jerseys.length === 0) return;

    // get unique sizes from all jerseys
    const sizes = new Set();
    jerseys.forEach(j => {
      if (j.sizes) {
        j.sizes.forEach(size => sizes.add(size));
      }
    });

    // get unique teams
    const teams = new Set(jerseys.map(j => j.name));

    setAvailableSizes([...sizes]);
    setAvailableTeams([...teams]);
  }, [jerseys]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredJerseys([]);
      return;
    }

    const text = searchText.toLowerCase();

    const results = jerseys.filter(j =>
      j.name.toLowerCase().includes(text)
    );

    setFilteredJerseys(results);
  }, [searchText, jerseys]);

  useEffect(() => {
    setVisibleCount(10);
  }, [filteredJerseys, searchText]);



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


          <div className="products-header">
            {!showSearch ? (
              <>
                <div className="product-count">{displayCount} Jerseys</div>

                <div className="header-icons">
                  <button className="search-btn" onClick={() => setShowSearch(true)}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>

                  <button className="filter-btn" onClick={() => setShowFilter(true)}>
                    <i className="fa-solid fa-sliders"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="search-bar">

                <i className="fa-solid fa-magnifying-glass search-icon"></i>

                <input
                  type="text"
                  className="search-input-bar"
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                <button className="search-close-btn" onClick={() => setShowSearch(false)}>×</button>
              </div>
            )}
          </div>

          {showFilter && (
            <div className="filter-overlay">
              <div className="filter-panel">

                <div className="filter-panel-header">
                  <span>FILTER</span>
                  <button className="close-filter" onClick={() => setShowFilter(false)}>×</button>
                </div>

                <div className="filter-options">
                  <div className="filter-row" onClick={() => setShowSizePanel(true)}>
                    <span>Size</span>
                    <span className="arrow">›</span>
                  </div>

                  <div className="filter-row" onClick={() => setShowTeamPanel(true)}>
                    <span>Team</span>
                    <span className="arrow">›</span>
                  </div>

                </div>

                <div className="filter-footer">
                  <button
                    className="clear-btn"
                    onClick={() => {
                      setSelectedSizes([]);
                      setSelectedTeams([]);
                      setFilteredJerseys([]);
                    }}
                  >
                    CLEAR
                  </button>

                  <button
                    className="view-btn"
                    onClick={() => {

                      let results = jerseys;

                      // FILTER BY SIZE
                      if (selectedSizes.length > 0) {
                        results = results.filter(j =>
                          j.sizes?.some(size => selectedSizes.includes(size))
                        );
                      }

                      // FILTER BY TEAM
                      if (selectedTeams.length > 0) {
                        results = results.filter(j =>
                          selectedTeams.includes(j.name)
                        );
                      }

                      // ⭐ FILTER BY SEARCH TEXT (Step 4)
                      if (searchText.trim() !== "") {
                        const text = searchText.toLowerCase();
                        results = results.filter(j =>
                          j.name.toLowerCase().includes(text)
                        );
                      }

                      setFilteredJerseys(results);
                      setShowFilter(false);
                      setShowSizePanel(false);
                      setShowTeamPanel(false);
                    }}
                  >
                    APPLY
                  </button>


                </div>

              </div>
            </div>
          )}
          {showSizePanel && (
            <div className="filter-overlay">
              <div className="filter-panel">

                <div className="filter-panel-header">
                  <button className="back-btn" onClick={() => setShowSizePanel(false)}>←</button>
                  <span>SIZE</span>
                  <button className="close-filter" onClick={() => setShowSizePanel(false)}>×</button>
                </div>

                <div className="filter-options">

                  {availableSizes.map(size => (
                    <label key={size} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      <span className="label-text">{size}</span>
                    </label>
                  ))}

                </div>

              </div>
            </div>
          )}

          {showTeamPanel && (
            <div className="filter-overlay">
              <div className="filter-panel">

                <div className="filter-panel-header">
                  <button className="back-btn" onClick={() => setShowTeamPanel(false)}>←</button>
                  <span>TEAM</span>
                  <button className="close-filter" onClick={() => setShowTeamPanel(false)}>×</button>
                </div>

                <div className="filter-options">

                  {availableTeams.map(team => (
                    <label key={team} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team)}
                        onChange={() => toggleTeam(team)}
                      />
                      <span className="label-text">{team}</span>
                    </label>
                  ))}

                </div>

              </div>
            </div>
          )}



          <div className="jersey-grid">
            {activeList.slice(0, visibleCount).map((jersey) => (

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
          {activeList.length > visibleCount && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMore}>
                SHOOT
              </button>
            </div>
          )}

          {/* ===== BOTTOM INFO ACCORDION ===== */}
          <div className="bottom-info">

            {[
              { id: "delivery", title: "DELIVERY", content: "..." },
              { id: "payments", title: "PAYMENTS", content: "..." },
              { id: "returns", title: "RETURNS & REFUNDS", content: "..." },
              { id: "productsize", title: "PRODUCT & SIZE", content: "..." },
              { id: "washcare", title: "WASH CARE", content: "..." },
            ].map((item) => (
              <div key={item.id} className="info-section">

                <div
                  className="info-item"
                  onClick={() =>
                    setOpenSection(openSection === item.id ? null : item.id)
                  }
                >
                  {item.title}

                  <span className="arrow">
                    {openSection === item.id ? "−" : "+"}
                  </span>
                </div>

                {openSection === item.id && (
                  <div className="info-content">{item.content}</div>
                )}

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
