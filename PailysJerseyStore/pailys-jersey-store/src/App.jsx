import React from 'react';
import './index.css';
import logo from './assets/logo.png';

// ✅ Updated image imports
import liverpool from './assets/liverpool.jpg';
import realmadrid from './assets/real-madrid.jpg';
import manunited from './assets/manunited.jpg';
import arsenal from './assets/arsenal.jpg';

function App() {
  const jerseys = [
    {
      id: 1,
      name: "Liverpool FC 24/25 Home Jersey",
      price: "₹1,499",
      sizes: ["S", "M", "L", "XL"],
      image: liverpool,
    },
    {
      id: 2,
      name: "Real Madrid 24/25 Away Jersey",
      price: "₹1,599",
      sizes: ["S", "M", "L", "XL"],
      image: realmadrid,
    },
    {
      id: 3,
      name: "Arsenal FC 24/25 Home Jersey",
      price: "₹1,399",
      sizes: ["S", "M", "L"],
      image: arsenal,
    },
    {
      id: 4,
      name: "Manchester United 24/25 Away Jersey",
      price: "₹1,499",
      sizes: ["S", "M", "L", "XL"],
      image: manunited,
    },
    // duplicate for second row
    {
      id: 5,
      name: "Liverpool FC 24/25 Home Jersey",
      price: "₹1,499",
      sizes: ["S", "M", "L", "XL"],
      image: liverpool,
    },
    {
      id: 6,
      name: "Real Madrid 24/25 Away Jersey",
      price: "₹1,599",
      sizes: ["S", "M", "L", "XL"],
      image: realmadrid,
    },
    {
      id: 7,
      name: "Arsenal FC 24/25 Home Jersey",
      price: "₹1,399",
      sizes: ["S", "M", "L"],
      image: arsenal,
    },
    {
      id: 8,
      name: "Manchester United 24/25 Away Jersey",
      price: "₹1,499",
      sizes: ["S", "M", "L", "XL"],
      image: manunited,
    },
  ];

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
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <i className="fab fa-whatsapp"></i>
            <span>+91 98765 43210</span>
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

      {/* ===== JERSEY SECTION ===== */}
      <section className="jersey-section">
        <div className="jersey-grid">
          {jerseys.map((jersey) => (
            <div key={jersey.id} className="jersey-card">
              <img src={jersey.image} alt={jersey.name} className="jersey-image" />
              <h3>{jersey.name}</h3>
              <p className="price">{jersey.price}</p>
              <p className="sizes">Sizes: {jersey.sizes.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
