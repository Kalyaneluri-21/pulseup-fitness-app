import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`w-full px-3 py-1.5 flex items-center justify-between relative shadow-md ${
        theme === "light"
          ? "bg-gradient-to-r from-purple-100 to-white"
          : "bg-gradient-to-r from-black to-slate-900"
      }`}
    >
      <Link to="/" className="flex items-center gap-2">
        <h1
          className={`text-xl font-bold transition-all duration-300 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          PulseUp
        </h1>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium dark:text-gray-200">
        <Link to="/" className="hover:text-purple-600 transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-purple-600 transition">
          About
        </Link>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-gray-100 cursor-pointer hover:text-purple-600 dark:hover:bg-gray-700 transition"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
        {!user ? (
          <>
            <Link to="/login" className="hover:text-purple-600 transition">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-white hover:text-purple-800 border-purple-500 hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4 relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-12 right-0 bg-white dark:bg-slate-800 shadow-lg rounded-xl w-48 flex flex-col text-gray-700 dark:text-gray-200 font-medium">
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-xl"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    alert("Change Profile Pic clicked!");
                    setIsMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Change Profile Pic
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-xl text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 border border-gray-300">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>
        )}
      </nav>

      <button
        className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {isMobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-slate-900 shadow-md md:hidden flex flex-col items-center gap-4 py-4 z-50 text-gray-700 dark:text-gray-200">
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileOpen(false)}
            className="hover:text-blue-600 transition"
          >
            About
          </Link>
          <button
            onClick={() => {
              dispatch(toggleTheme());
              setIsMobileOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileOpen(false)}
                className="hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileOpen(false)}
                className="px-4 py-2 rounded-xl bg-white text-blue-600 border border-blue-500 hover:bg-blue-50 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <Link
                to="/settings"
                onClick={() => setIsMobileOpen(false)}
                className="w-full text-center py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  alert("Change Profile Pic clicked!");
                  setIsMobileOpen(false);
                }}
                className="w-full text-center py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Change Profile Pic
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
