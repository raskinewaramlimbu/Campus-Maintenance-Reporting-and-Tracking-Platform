import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/submit", label: "Report an issue" },
  { to: "/reports", label: "Track reports" },
  { to: "/guidance", label: "Guidance" },
  { to: "/privacy", label: "Privacy" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" end>
          <span className="brand-mark">FMC</span>
          <span className="brand-name">FixMyCampus</span>
        </NavLink>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                Dashboard
              </NavLink>
              <button type="button" className="nav-link nav-link-button" onClick={handleLogout}>
                Log out ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Staff login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
