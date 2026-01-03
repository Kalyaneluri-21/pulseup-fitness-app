import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setUser, setAuthError, setAuthStatus } from "../../features/AuthSlice";
import { toggleTheme } from "../../features/ThemeSlice";
import { Moon, Sun, ArrowLeft } from "lucide-react";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      dispatch(setAuthStatus("Loading"));

      const cred = await signInWithEmailAndPassword(auth, email, password);

      dispatch(
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || "",
          photoURL: cred.user.photoURL || "",
        })
      );

      navigate("/");
    } catch (err) {
      const cleanedError = err.message.replace("Firebase:", "").trim();
      setError(cleanedError);
      dispatch(setAuthError(cleanedError));
    } finally {
      setLoading(false);
      setPassword("");
      setEmail("");
    }
  };

  return (
    <>
      {/* HEADER */}
      <header
        className={`w-full px-6 py-3 flex items-center justify-between shadow-md transition-colors duration-500 backdrop-blur-md`}
        style={{
          background:
            theme === "light"
              ? "linear-gradient(135deg, #BBA4E6 0%, #E9E2F9 100%)"
              : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <Link to="/" className="flex items-center">
          <h1
            className={`text-xl font-bold transition-all duration-300 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            PulseUp
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {/* THEME TOGGLE */}
          <button
            onClick={() => dispatch(toggleTheme())}
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

          {/* BACK BTN */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md"
            style={{
              color: "#fff",
              background:
                theme === "light"
                  ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
                  : "linear-gradient(90deg, #3CB14A, #2A6A28)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div
        className="grid place-items-center min-h-[calc(100vh-60px)] px-4"
        style={{
          background:
            theme === "light"
              ? "linear-gradient(135deg, #BBA4E6 0%, #E9E2F9 100%)"
              : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        }}
      >
        <div
          className="w-[380px] p-8 rounded-2xl backdrop-blur-lg shadow-xl transition"
          style={{
            background:
              theme === "light"
                ? "rgba(255, 255, 255, 0.75)"
                : "rgba(20, 20, 20, 0.85)",
          }}
        >
          <h2
            className="text-center font-extrabold text-2xl mb-6"
            style={{
              color: theme === "light" ? "#4B0082" : "#E5E5E5",
            }}
          >
            🔐 Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg shadow-inner focus:outline-none transition"
              style={{
                backgroundColor:
                  theme === "light" ? "rgba(255,255,255,0.85)" : "#1B1B1Bcc",
                color: theme === "light" ? "#4B0082" : "#E5E5E5",
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg shadow-inner focus:outline-none transition"
              style={{
                backgroundColor:
                  theme === "light" ? "rgba(255,255,255,0.85)" : "#1B1B1Bcc",
                color: theme === "light" ? "#4B0082" : "#E5E5E5",
              }}
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white transition-transform shadow-lg"
              style={{
                background:
                  theme === "light"
                    ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
                    : "linear-gradient(90deg, #3CB14A, #2A6A28)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {loading ? "Logging in…" : "🚀 Login"}
            </button>
          </form>

          <p
            className="mt-4 text-sm text-center"
            style={{
              color: theme === "light" ? "#4B0082" : "#E5E5E5",
            }}
          >
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold underline"
              style={{
                color: theme === "light" ? "#6B54D3" : "#3CB14A",
              }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
