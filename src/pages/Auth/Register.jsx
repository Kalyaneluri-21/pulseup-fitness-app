import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { setUser, setAuthStatus, setAuthError } from "../../features/AuthSlice";
import { toggleTheme } from "../../features/ThemeSlice";
import { Moon, Sun, ArrowLeft } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your full name");

    try {
      setLoading(true);
      dispatch(setAuthStatus("loading"));

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        photoURL: cred.user.photoURL || "",
        createdAt: Date.now(),
      });

      dispatch(
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: cred.user.photoURL || "",
        })
      );

      navigate("/login");
      setDone(true);
    } catch (err) {
      const cleanedError = err.message.replace("Firebase:", "").trim();
      setError(cleanedError);
      dispatch(setAuthError(cleanedError));
    } finally {
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <>
      {/* HEADER */}
      <header
        className={`w-full px-6 py-3 flex items-center justify-between shadow-md backdrop-blur-md transition-all duration-500
        ${
          theme === "light"
            ? "bg-gradient-to-r from-[#BBA4E6] to-[#E9E2F9]"
            : "bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364]"
        }`}
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
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition hover:scale-105
            ${
              theme === "light"
                ? "bg-gradient-to-r from-[#6B54D3] to-[#8C77E7]"
                : "bg-gradient-to-r from-[#3CB14A] to-[#2A6A28]"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-full transition hover:scale-110 
            ${theme === "light" ? "bg-[#E9E2F9]" : "bg-[#1B1B1B]"}`}
          >
            {theme === "light" ? (
              <Moon className="w-6 h-6 text-[#6B54D3]" />
            ) : (
              <Sun className="w-6 h-6 text-[#3CB14A]" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div
        className={`grid place-items-center min-h-[calc(100vh-60px)] px-4 transition-all duration-500
        ${
          theme === "light"
            ? "bg-gradient-to-br from-[#BBA4E6] to-[#E9E2F9]"
            : "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]"
        }`}
      >
        <div
          className={`w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-md transition
          ${theme === "light" ? "bg-white/80" : "bg-[#141414]/90"}`}
        >
          <h2
            className={`text-center font-extrabold text-2xl mb-6
            ${theme === "light" ? "text-[#4B0082]" : "text-gray-200"}`}
          >
            ✨ Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-none text-sm shadow-inner focus:ring-2 focus:ring-indigo-500
              ${
                theme === "light"
                  ? "bg-white/90 text-[#4B0082]"
                  : "bg-[#1B1B1B]/80 text-gray-200"
              }`}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-none text-sm shadow-inner focus:ring-2 focus:ring-indigo-500
              ${
                theme === "light"
                  ? "bg-white/90 text-[#4B0082]"
                  : "bg-[#1B1B1B]/80 text-gray-200"
              }`}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-none text-sm shadow-inner focus:ring-2 focus:ring-indigo-500
              ${
                theme === "light"
                  ? "bg-white/90 text-[#4B0082]"
                  : "bg-[#1B1B1B]/80 text-gray-200"
              }`}
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {done && (
              <p className="text-green-500 text-sm text-center">
                ✅ Registered Successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transform transition hover:scale-[1.02]
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : theme === "light"
                  ? "bg-gradient-to-r from-[#6B54D3] to-[#8C77E7]"
                  : "bg-gradient-to-r from-[#3CB14A] to-[#2A6A28]"
              }`}
            >
              {loading ? "Creating…" : "🚀 Register"}
            </button>
          </form>

          <p
            className={`mt-6 text-sm text-center
            ${theme === "light" ? "text-[#4B0082]" : "text-gray-300"}`}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-semibold underline
              ${theme === "light" ? "text-[#6B54D3]" : "text-[#3CB14A]"}`}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
