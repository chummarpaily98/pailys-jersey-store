import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import "./UpdateStock.css";

const UpdateStock = () => {

    const [jerseys, setJerseys] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        const unsubscribe = onSnapshot(collection(db, "jerseys"), (snapshot) => {

            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setJerseys(list);

        });

        return () => unsubscribe();

    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin-auth");
        window.location.href = "/admin-login";
    };

    const updateSizeStock = async (jersey, size, change) => {

        const currentQty = jersey.sizes?.[size] || 0;
        const newQty = currentQty + change;

        if (newQty < 0) return;

        const newTotalStock = jersey.totalStock + change;

        await updateDoc(doc(db, "jerseys", jersey.id), {
            [`sizes.${size}`]: newQty,
            totalStock: newTotalStock
        });

    };

    const filtered = jerseys.filter(j =>
        j.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="stock-container">

            <div className="stock-header">
                <h2>Update Jersey Stock</h2>

                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <input
                type="text"
                placeholder="Search jersey..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="stock-search"
            />

            <table className="stock-table">

                <thead>
                    <tr>
                        <th>Jersey</th>
                        <th>S</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                        <th>XXL</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>

                    {filtered.map(jersey => (

                        <tr key={jersey.id}>

                            <td className="jersey-name-cell">
                                {jersey.name}
                            </td>

                            {["S", "M", "L", "XL", "XXL"].map(size => {

                                const qty = jersey.sizes?.[size] || 0;

                                return (

                                    <td key={size}>

                                        <button
                                            className="stock-btn"
                                            onClick={() => updateSizeStock(jersey, size, -1)}
                                        >
                                            -
                                        </button>

                                        <span className="stock-number">
                                            {qty}
                                        </span>

                                        <button
                                            className="stock-btn"
                                            onClick={() => updateSizeStock(jersey, size, +1)}
                                        >
                                            +
                                        </button>

                                    </td>

                                );

                            })}

                            <td className="total-stock">
                                {jersey.totalStock}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );

};

export default UpdateStock;