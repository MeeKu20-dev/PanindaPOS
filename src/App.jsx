import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <POS />
          </ProtectedRoute>
        }
      />

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
    </Routes>
  );
}
