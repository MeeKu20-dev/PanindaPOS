import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUserRole } from "../lib/auth";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [role, setRole] = useState(() => sessionStorage.getItem("role"));

  useEffect(() => {
    const loadRole = async () => {
      const userRole = await getCurrentUserRole();
      if (userRole) {
        setRole(userRole);
        sessionStorage.setItem("role", userRole);
      }
    };

    loadRole();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("role");
    setRole(null);
    navigate("/");
  };

  return (
    <>
      <div className="navigation">
        <ul>
          <li className="nav-header">
            <div className="header-content">
              <span className="logo">🛍️</span>
              <span className="app-name">PanindaPOS</span>
            </div>
          </li>

          {(role === "cashier" || role === "admin") && (
            <>
              <li>
                <NavLink to="/pos" className="menu-item">
                  <span className="icon">💵</span>
                  <span className="title">Point of Sales</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/reports" className="menu-item">
                  <span className="icon">📊</span>
                  <span className="title">Reports</span>
                </NavLink>
              </li>
            </>
          )}

          {role === "admin" && (
            <>
              <li>
                <NavLink to="/inventory" className="menu-item">
                  <span className="icon">📦</span>
                  <span className="title">Inventory</span>
                </NavLink>
              </li>
            </>
          )}

          <li
            onClick={() => setShowLogoutConfirm(true)}
            className="menu-item logout-item"
          >
            <span className="icon">⬅️</span>
            <span className="title">Sign Out</span>
          </li>
        </ul>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to log out?</p>

            <div className="modal-actions">
              <button onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleSignOut();
                }}
                style={{ background: "#d32f2f", color: "white" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
