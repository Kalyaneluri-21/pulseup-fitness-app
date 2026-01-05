import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Menu, X, User, Sun, Moon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/ThemeSlice";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    setIsMobileOpen(false);
  };

  const showDashboard = !!user && location.pathname === "/";
  const isHomePage = location.pathname === "/";

  const headerGradient =
    theme === "light"
      ? "linear-gradient(135deg, #BBA4E6 0%, #E9E2F9 100%)"
      : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
  const textColor = theme === "light" ? "#4B0082" : "#E5E5E5";
  const accentBtnGradient =
    theme === "light"
      ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
      : "linear-gradient(90deg, #3CB14A, #2A6A28)";
  const surfaceBg =
    theme === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(20, 20, 20, 0.92)";
  const popShadow =
    theme === "light"
      ? "0 8px 20px rgba(107,84,211,0.25)"
      : "0 8px 20px rgba(60,177,74,0.25)";

  return (
    <header
      className="w-full px-6 py-3 flex items-center justify-between shadow-md transition-colors duration-500 backdrop-blur-md"
      style={{ background: headerGradient }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <h1
          className={`text-xl font-bold transition-all duration-300 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          PulseUp
        </h1>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6 font-medium">
        {isHomePage ? (
          // Full navigation for home page
          <>
            <Link
              to="/"
              className="transition hover:opacity-90"
              style={{ color: textColor }}
            >
              Home
            </Link>

            <Link
              to="/about"
              className="transition hover:opacity-90"
              style={{ color: textColor }}
            >
              About
            </Link>

            {showDashboard && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
                style={{
                  color: "#fff",
                  background: accentBtnGradient,
                }}
              >
                Dashboard
              </Link>
            )}

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="transition hover:opacity-90"
                  style={{ color: textColor }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
                  style={{
                    color: "#fff",
                    background: accentBtnGradient,
                  }}
                >
                  Start Now
                </Link>

                {/* Theme Toggle right beside "Start Now" */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-full transition hover:scale-110 relative group"
                  style={{
                    backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                  }}
                  aria-label="Toggle Theme"
                  title={
                    theme === "light"
                      ? "Switch to Dark Mode"
                      : "Switch to Light Mode"
                  }
                >
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-[#6B54D3]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#3CB14A]" />
                  )}
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 relative">
                {/* Theme Toggle for logged-in users */}
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-full transition hover:scale-110 relative group"
                  style={{
                    backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                  }}
                  aria-label="Toggle Theme"
                  title={
                    theme === "light"
                      ? "Switch to Dark Mode"
                      : "Switch to Light Mode"
                  }
                >
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-[#6B54D3]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#3CB14A]" />
                  )}
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>

                {/* User menu toggle */}
                <button
                  className="p-2 rounded-full transition hover:scale-105"
                  style={{
                    backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                  }}
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  <Menu className="w-6 h-6" style={{ color: textColor }} />
                </button>

                {/* Dropdown */}
                {isMenuOpen && (
                  <div
                    className="absolute top-12 right-0 w-56 rounded-xl overflow-hidden backdrop-blur-lg"
                    style={{
                      background: surfaceBg,
                      boxShadow: popShadow,
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                    }}
                  >
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 transition hover:opacity-90"
                      style={{ color: textColor }}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        alert("Change Profile Pic clicked!");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 transition hover:opacity-90"
                      style={{ color: textColor }}
                    >
                      Change Profile Pic
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 transition hover:opacity-90"
                      style={{ color: "#ef4444" }}
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Avatar */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                    style={{
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: theme === "light" ? "#F3EEFA" : "#1B1B1B",
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <User
                      className="w-6 h-6"
                      style={{
                        color: theme === "light" ? "#6B54D3" : "#3CB14A",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Simplified navigation for other pages
          <div className="flex items-center gap-4">
            {/* Home button */}
            <Link
              to="/"
              className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
              style={{
                color: "#fff",
                background: accentBtnGradient,
              }}
            >
              Home
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full transition hover:scale-110 relative group"
              style={{
                backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
              }}
              aria-label="Toggle Theme"
              title={
                theme === "light"
                  ? "Switch to Dark Mode"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6 text-[#6B54D3]" />
              ) : (
                <Sun className="w-6 h-6 text-[#3CB14A]" />
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>

            {/* Profile Icon (only for logged-in users) */}
            {user && (
              <div className="flex items-center gap-2">
                {/* User menu toggle */}
                <button
                  className="p-2 rounded-full transition hover:scale-105"
                  style={{
                    backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                  }}
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  <Menu className="w-6 h-6" style={{ color: textColor }} />
                </button>

                {/* Dropdown */}
                {isMenuOpen && (
                  <div
                    className="absolute top-12 right-0 w-56 rounded-xl overflow-hidden backdrop-blur-lg"
                    style={{
                      background: surfaceBg,
                      boxShadow: popShadow,
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                    }}
                  >
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 transition hover:opacity-90"
                      style={{ color: textColor }}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        alert("Change Profile Pic clicked!");
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 transition hover:opacity-90"
                      style={{ color: textColor }}
                    >
                      Change Profile Pic
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 transition hover:opacity-90"
                      style={{ color: "#ef4444" }}
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Avatar */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                    style={{
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: theme === "light" ? "#F3EEFA" : "#1B1B1B",
                      border:
                        theme === "light"
                          ? "1px solid #E9E2F9"
                          : "1px solid #1B1B1B",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <User
                      className="w-6 h-6"
                      style={{
                        color: theme === "light" ? "#6B54D3" : "#3CB14A",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile toggle */}
      <button
        className="md:hidden p-2 rounded-full transition hover:scale-110"
        style={{ backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B" }}
        onClick={() => setIsMobileOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" style={{ color: textColor }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: textColor }} />
        )}
      </button>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div
          className="absolute top-16 left-0 w-full md:hidden flex flex-col items-center gap-4 py-4 z-50 backdrop-blur-lg"
          style={{
            background: surfaceBg,
            boxShadow: popShadow,
            borderTop:
              theme === "light" ? "1px solid #E9E2F9" : "1px solid #1B1B1B",
          }}
        >
          {isHomePage ? (
            // Full mobile navigation for home page
            <>
              <Link
                to="/"
                onClick={() => setIsMobileOpen(false)}
                className="transition hover:opacity-90"
                style={{ color: textColor }}
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={() => setIsMobileOpen(false)}
                className="transition hover:opacity-90"
                style={{ color: textColor }}
              >
                About
              </Link>

              {showDashboard && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
                  style={{ color: "#fff", background: accentBtnGradient }}
                >
                  Dashboard
                </Link>
              )}

              {!user ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="transition hover:opacity-90"
                    style={{ color: textColor }}
                  >
                    Login
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/register"
                      onClick={() => setIsMobileOpen(false)}
                      className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
                      style={{ color: "#fff", background: accentBtnGradient }}
                    >
                      Start Now
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(toggleTheme());
                        setIsMobileOpen(false);
                      }}
                      className="p-2 rounded-full transition hover:scale-110"
                      style={{
                        backgroundColor:
                          theme === "light" ? "#E9E2F9" : "#1B1B1B",
                      }}
                    >
                      {theme === "light" ? (
                        <Moon className="w-6 h-6 text-[#6B54D3]" />
                      ) : (
                        <Sun className="w-6 h-6 text-[#3CB14A]" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                  {/* Theme Toggle for logged-in users in mobile menu */}
                  <button
                    onClick={() => {
                      dispatch(toggleTheme());
                      setIsMobileOpen(false);
                    }}
                    className="p-2 rounded-full transition hover:scale-110 mb-2"
                    style={{
                      backgroundColor:
                        theme === "light" ? "#E9E2F9" : "#1B1B1B",
                    }}
                  >
                    {theme === "light" ? (
                      <Moon className="w-6 h-6 text-[#6B54D3]" />
                    ) : (
                      <Sun className="w-6 h-6 text-[#3CB14A]" />
                    )}
                  </button>

                  <Link
                    to="/settings"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: textColor }}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      alert("Change Profile Pic clicked!");
                      setIsMobileOpen(false);
                    }}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: textColor }}
                  >
                    Change Profile Pic
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: "#ef4444" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            // Simplified mobile navigation for other pages
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Home button */}
              <Link
                to="/"
                onClick={() => setIsMobileOpen(false)}
                className="px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
                style={{ color: "#fff", background: accentBtnGradient }}
              >
                Home
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  dispatch(toggleTheme());
                  setIsMobileOpen(false);
                }}
                className="p-2 rounded-full transition hover:scale-110"
                style={{
                  backgroundColor: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                }}
              >
                {theme === "light" ? (
                  <Moon className="w-6 h-6 text-[#6B54D3]" />
                ) : (
                  <Sun className="w-6 h-6 text-[#3CB14A]" />
                )}
              </button>

              {/* Profile options (only for logged-in users) */}
              {user && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: textColor }}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      alert("Change Profile Pic clicked!");
                      setIsMobileOpen(false);
                    }}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: textColor }}
                  >
                    Change Profile Pic
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 transition hover:opacity-90"
                    style={{ color: "#ef4444" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
