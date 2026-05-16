import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const user = data.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setLoading(false);

    if (profileError) {
      setError("Could not load user profile");
      await supabase.auth.signOut();
      return;
    }

    const role = profile?.role;

    if (role !== "admin" && role !== "cashier") {
      setError("No role assigned to this user");
      await supabase.auth.signOut();
      sessionStorage.removeItem("role");
      return;
    }

    sessionStorage.setItem("role", role);

    if (role === "admin") {
      navigate("/inventory");
    } else {
      navigate("/pos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>PanindaPOS</h2>
        <p>Sign in to continue</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error-text">{error}</div>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
