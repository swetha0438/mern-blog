import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
];

const privateLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/create-post", label: "Create Post" },
  { to: "/my-blogs", label: "My Blogs" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { isAuthenticated, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const links = isAuthenticated ? privateLinks : publicLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Fieldnotes</Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <nav id="primary-nav" className={`nav-links${open ? " open" : ""}`} aria-label="Primary">
          {!loading &&
            links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          {!loading && isAuthenticated && (
            <button type="button" className="nav-link nav-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
