import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaUserCircle } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .single();

      setDisplayName(profile?.display_name || "User");
      setRole(profile?.role || null);
    };

    loadUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

            <div className="user-info">
              <div className="user-avatar">
                <FaUserCircle />
              </div>

              <div className="user-details">
                <div className="user-name">{displayName}</div>
                <div className="user-role">{role}</div>
              </div>
            </div>
          </li>

          {role === "cashier" && (
            <li>
              <NavLink to="/pos" className="menu-item">
                <span className="icon">💵</span>
                <span className="title">Point of Sales</span>
              </NavLink>
            </li>
          )}

          {role === "admin" && (
            <>
              <li>
                <NavLink to="/pos" className="menu-item">
                  <span className="icon">💵</span>
                  <span className="title">Point of Sales</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/inventory" className="menu-item">
                  <span className="icon">📦</span>
                  <span className="title">Inventory</span>
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
                onClick={handleSignOut}
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
