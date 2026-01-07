import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { X, User, Sun, Moon, Settings, LogOut, Camera, Edit3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/ThemeSlice";
import { clearUser } from "../features/AuthSlice";
import { clearBuddies } from "../features/BuddySlice";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      dispatch(clearBuddies());
      setUser(null); // 🔥 fix: clear local state
      setIsProfileMenuOpen(false);
      setIsMobileOpen(false);
      navigate("/"); // 🔥 redirect to home after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChangeProfilePic = () => {
    alert("Change Profile Picture functionality will be implemented here!");
    setIsProfileMenuOpen(false);
  };

  const handleChangeName = () => {
    alert("Change Name functionality will be implemented here!");
    setIsProfileMenuOpen(false);
  };

  const showDashboard = !!user && location.pathname === "/";
  const isHomePage = location.pathname === "/";

  const headerGradient =
    theme === "light"
      ? "linear-gradient(135deg, #caf0f8 0%, #e0f2fe 50%, #f0fdfa 100%)"
      : "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)";
  const textColor = theme === "light" ? "#000000" : "#E5E5E5";
  const accentBtnGradient =
    theme === "light"
      ? "linear-gradient(90deg, #00b4d8, #48bfe3)"
      : "linear-gradient(90deg, #3CB14A, #2A6A28)";
  const surfaceBg =
    theme === "light" ? "rgba(202, 240, 248, 0.95)" : "rgba(26, 26, 46, 0.95)";
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
          <>
            <Link
              to="/"
              className="transition hover:opacity-90"
              style={{ color: textColor }}
            >
              Home
            </Link>
            <a href="/#about"  className="transition hover:opacity-90"
              style={{ color: textColor }}>About</a>
            
            <Link to="/shop"
              className="transition hover:opacity-90"
              style={{ color: textColor }} >
              Shop
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

                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-full transition hover:scale-110 relative group"
                  style={{
                    backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e",
                  }}
                  aria-label="Toggle Theme"
                  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-[#00b4d8]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#4a9eff]" />
                  )}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 relative">
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-full transition hover:scale-110 relative group"
                  style={{
                    backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e",
                  }}
                  aria-label="Toggle Theme"
                  title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {theme === "light" ? (
                    <Moon className="w-6 h-6 text-[#00b4d8]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#4a9eff]" />
                  )}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    className="p-2 rounded-full transition hover:scale-105"
                    style={{ backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e" }}
                    onClick={() => setIsProfileMenuOpen((v) => !v)}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="profile"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6" style={{ color: textColor }} />
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className="absolute top-12 right-0 w-64 rounded-xl overflow-hidden backdrop-blur-lg z-50"
                      style={{
                        background: surfaceBg,
                        boxShadow: popShadow,
                        border: theme === "light" ? "1px solid #caf0f8" : "1px solid #1a1a2e",
                      }}
                    >
                      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                        <span className="font-semibold" style={{ color: textColor }}>
                          Profile Menu
                        </span>
                        <button
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          <X className="w-4 h-4" style={{ color: textColor }} />
                        </button>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-600"
                          style={{ color: textColor }}
                        >
                          <User className="w-5 h-5" />
                          <span>View Profile</span>
                        </Link>
                        
                        <button
                          onClick={handleChangeName}
                          className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                          style={{ color: textColor }}
                        >
                          <Edit3 className="w-5 h-5" />
                          <span>Change Name</span>
                        </button>
                        
                        <button
                          onClick={handleChangeProfilePic}
                          className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                          style={{ color: textColor }}
                        >
                          <Camera className="w-5 h-5" />
                          <span>Change Profile Picture</span>
                        </button>
                        
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-600"
                          style={{ color: textColor }}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                          style={{ color: "#ef4444" }}
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4">
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

            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full transition hover:scale-110 relative group"
              style={{
                backgroundColor: theme === "light" ? "#E9E2F9" : "#1a1a2e",
              }}
              aria-label="Toggle Theme"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6 text-[#6B54D3]" />
              ) : (
                <Sun className="w-6 h-6 text-[#4a9eff]" />
              )}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>

            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="p-2 rounded-full transition hover:scale-105"
                  style={{ backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e" }}
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" style={{ color: textColor }} />
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute top-12 right-0 w-64 rounded-xl overflow-hidden backdrop-blur-lg z-50"
                    style={{
                      background: surfaceBg,
                      boxShadow: popShadow,
                      border: theme === "light" ? "1px solid #caf0f8" : "1px solid #1a1a2e",
                    }}
                  >
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                      <span className="font-semibold" style={{ color: textColor }}>
                        Profile Menu
                      </span>
                      <button
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <X className="w-4 h-4" style={{ color: textColor }} />
                      </button>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                        style={{ color: textColor }}
                      >
                        <User className="w-5 h-5" />
                        <span>View Profile</span>
                      </Link>
                      
                      <button
                        onClick={handleChangeName}
                        className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        style={{ color: textColor }}
                      >
                        <Edit3 className="w-5 h-5" />
                        <span>Change Name</span>
                      </button>
                      
                      <button
                        onClick={handleChangeProfilePic}
                        className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                        style={{ color: textColor }}
                      >
                        <Camera className="w-5 h-5" />
                        <span>Change Profile Picture</span>
                      </button>
                      
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                        style={{ color: textColor }}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      
                      <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                        style={{ color: "#ef4444" }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {user && (
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full transition hover:scale-110"
            style={{
              backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e",
            }}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-[#00b4d8]" />
            ) : (
              <Sun className="w-5 h-5 text-[#4a9eff]" />
            )}
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              className="p-2 rounded-full transition hover:scale-105"
              style={{ backgroundColor: theme === "light" ? "#caf0f8" : "#1a1a2e" }}
              onClick={() => setIsProfileMenuOpen((v) => !v)}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" style={{ color: textColor }} />
              )}
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute top-12 right-0 w-56 rounded-xl overflow-hidden backdrop-blur-lg z-50"
                style={{
                  background: surfaceBg,
                  boxShadow: popShadow,
                  border: theme === "light" ? "1px solid #caf0f8" : "1px solid #1a1a2e",
                }}
              >
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                  <span className="font-semibold text-sm" style={{ color: textColor }}>
                    Profile Menu
                  </span>
                  <button
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <X className="w-4 h-4" style={{ color: textColor }} />
                  </button>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
                    style={{ color: textColor }}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">View Profile</span>
                  </Link>
                  
                  <button
                    onClick={handleChangeName}
                    className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    style={{ color: textColor }}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm">Change Name</span>
                  </button>
                  
                  <button
                    onClick={handleChangeProfilePic}
                    className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    style={{ color: textColor }}
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Change Profile Picture</span>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 transition hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
                    style={{ color: "#ef4444" }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
