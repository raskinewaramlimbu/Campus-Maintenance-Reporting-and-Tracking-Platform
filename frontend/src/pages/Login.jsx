import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't log in, check your details and try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Staff login</h1>
      <p className="page-intro">
        Reporting and browsing issues doesn't need an account &mdash; this is only for Estates
        staff who manage reports and view analytics.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="field-error form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="muted">
          No staff account yet? <Link to="/register">Register one</Link>
        </p>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Seeded demo account (if you ran <code>npm run seed</code>): staff@fixmycampus.test /
          password123
        </p>
      </form>
    </div>
  );
}
