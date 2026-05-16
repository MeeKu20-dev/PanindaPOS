import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole } from "../lib/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState("loading");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const check = async () => {
      const userRole = await getCurrentUserRole();

      if (!userRole) {
        setStatus("unauthorized");
        return;
      }

      setRole(userRole);
      sessionStorage.setItem("role", userRole);

      if (allowedRoles.includes(userRole)) {
        setStatus("allowed");
      } else {
        setStatus("forbidden");
      }
    };

    check();
  }, [allowedRoles]);

  if (status === "loading") {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to={role === "cashier" ? "/pos" : "/"} replace />;
  }

  return children;
}
