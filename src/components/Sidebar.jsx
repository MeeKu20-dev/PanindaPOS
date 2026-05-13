import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // HANDLE INVENTORY CLICK
  const handleInventoryClick = () => {
    // If already inside inventory → do nothing
    if (location.pathname === "/inventory") return;

    if (unlocked) {
      navigate("/inventory");
    } else {
      setShowModal(true);
    }
  };

  // CHECK PASSWORD
  const handleUnlock = () => {
    if (password === "1234") {
      setUnlocked(true);
      setShowModal(false);
      setPassword("");
      navigate("/inventory");
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <>
      <div className="navigation">
        <ul>
          {/* HEADER */}
          <li className="nav-header">
            <div className="header-content">
              <span className="logo">🛍️</span>
              <span className="app-name">PanindaPOS</span>
            </div>
          </li>

          {/* POS */}
          <li>
            <NavLink to="/pos" className="menu-item">
              <span className="icon">💵</span>
              <span className="title">Point of Sales</span>
            </NavLink>
          </li>

          {/* INVENTORY (PROTECTED) */}
          <li
            onClick={handleInventoryClick}
            className={`menu-item ${
              location.pathname === "/inventory" ? "active" : ""
            }`}
          >
            <span className="icon">📦</span>
            <span className="title">Inventory</span>
          </li>

          {/* REPORTS */}
          <li>
            <NavLink to="/reports" className="menu-item">
              <span className="icon">📊</span>
              <span className="title">Reports</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Inventory Access</h3>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>

              <button onClick={handleUnlock}>Enter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
