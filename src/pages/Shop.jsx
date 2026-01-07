import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../components/Header"
// Import product images (kept exactly as you wrote)
import gummies from "../assets/creatinegummies.jpg";
import dumbell from "../assets/dumbell.webp";
import bcaa from "../assets/bcaa.webp";
import gymbelt from "../assets/gymbelt.jpeg";
import wristband from "../assets/wristband.jpeg";
import prework from "../assets/prework.png";
import silajit from "../assets/silajit.webp";
import tonicwheel from "../assets/tonicwheel.webp";
import runningMachine from "../assets/runningMachine.webp";
import protien from "../assets/protien1.jpg";
import pushupbar from "../assets/pushupbar.jpeg";
import pullupbar from "../assets/pullupbar.jpg";
import rubberexcersice from "../assets/rubberexcersice.webp";
import shilajitgold from "../assets/shilajitgold.jpg";
import tshirt from "../assets/tshirt.png";

const products = [
  { id: 1, name: "Creatine Gummies", price: 499, image: gummies },
  { id: 2, name: "Dumbbell", price: 999, image: dumbell },
  { id: 3, name: "BCAA", price: 799, image: bcaa },
  { id: 4, name: "Gym Belt", price: 699, image: gymbelt },
  { id: 5, name: "Wrist Band", price: 199, image: wristband },
  { id: 6, name: "Preworkout", price: 899, image: prework },
  { id: 7, name: "Shilajit", price: 1499, image: silajit },
  { id: 8, name: "Tonic Wheel", price: 1299, image: tonicwheel },
  { id: 9, name: "Running Machine", price: 15999, image: runningMachine },
  { id: 10, name: "Protein Powder", price: 2499, image: protien },
  { id: 11, name: "Pushup Bar", price: 599, image: pushupbar },
  { id: 12, name: "Pullup Bar", price: 899, image: pullupbar },
  { id: 13, name: "Rubber Exercise Band", price: 399, image: rubberexcersice },
  { id: 14, name: "Shilajit Gold", price: 1999, image: shilajitgold },
  { id: 15, name: "PulseUp Tshirt", price: 450, image: tshirt },
];

const Shop = ({ cart, setCart }) => {
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();

  // Fallback local cart if parent doesn't pass setCart/cart
  const [localCart, setLocalCart] = useState(() => {
    try {
      const saved = localStorage.getItem("PulseUp_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist local cart only if using fallback
  useEffect(() => {
    if (typeof setCart !== "function") {
      localStorage.setItem("PulseUp_cart", JSON.stringify(localCart));
    }
  }, [localCart, setCart]);

  const usingParentCart = typeof setCart === "function";
  const cartCount = usingParentCart
    ? Array.isArray(cart) ? cart.length : 0
    : localCart.length;

  // Theme colors (same palette as your other pages)
  const bgPrimary = theme === "light" ? "bg-[#caf0f8]" : "bg-[#0b132b]";
  const textPrimary = theme === "light" ? "text-black" : "text-white";

  // Card colors for dark theme support
  const cardBg = theme === "light" ? "bg-white" : "bg-[#1c2541]";
  const cardTextPrimary = theme === "light" ? "text-black" : "text-white";
  const cardTextMuted = theme === "light" ? "text-gray-600" : "text-gray-300";
  const cardBorder = theme === "light" ? "border-gray-200" : "border-gray-700";

  // Add to cart (works with parent state or local fallback)
  const addToCart = (product) => {
    if (usingParentCart) {
      setCart((prev) => (Array.isArray(prev) ? [...prev, product] : [product]));
    } else {
      setLocalCart((prev) => [...prev, product]);
    }
  };

  return (
    <>
        <Header/>
    <div className={`${bgPrimary} min-h-screen py-10 px-6`}>
  {/* Header with back + cart */}
  <div className="flex justify-between items-center mb-8">
    {/* Back Button (Left) */}
    <button
      onClick={() => navigate("/")}
      className="text-lg font-semibold hover:cursor-pointer bg-[#00b4d8] text-white px-5 py-2 rounded-lg hover:bg-[#0096c7] transition"
    >
      Back
    </button>

    {/* Cart Button (Right) */}
    <button
      onClick={() => navigate("/cart")}
      className="relative text-lg font-semibold bg-[#00b4d8] hover:cursor-pointer text-white px-5 py-2 rounded-lg hover:bg-[#0096c7] transition"
    >
      Cart 🛒
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-sm">
          {cartCount}
        </span>
      )}
    </button>
  </div>



      <p className={`mb-8 text-lg italic ${textPrimary}`}>
        We already chose the best for you — no need to get confused with too many products!
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`${cardBg} ${cardTextPrimary} border ${cardBorder} rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-40 h-40 object-contain mb-4"
            />
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className={`${cardTextMuted}`}>
              <span className="line-through mr-2">
                ₹{Math.round(product.price + (product.price * 20) / 100)}
              </span>
              ₹{product.price} only
            </p>
            <button
              onClick={() => addToCart(product)}
              className="mt-3 bg-[#00b4d8] text-white px-4 py-2 rounded-lg hover:bg-[#0096c7] transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Shop;