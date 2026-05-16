import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* ALL AUTH ROUTES */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/pos" element={<POS />} />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
