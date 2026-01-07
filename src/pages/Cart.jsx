import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Cart = ({ cart, setCart }) => {
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();

  const bgPrimary = theme === "light" ? "bg-[#caf0f8]" : "bg-[#0b132b]";
  const textPrimary = theme === "light" ? "text-black" : "text-white";

  const removeFromCart = (id) => {
    setCart(cart.filter((item, index) => index !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className={`${bgPrimary} min-h-screen py-10 px-6`}>
      <h1 className={`text-3xl font-bold mb-6 ${textPrimary}`}>Your Cart 🛒</h1>

      {cart.length === 0 ? (
        <p className={`${textPrimary} text-lg`}>Your cart is empty.</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow mb-3"
              >
                <span className="font-semibold">{item.name}</span>
                <span>₹{item.price}</span>
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-6">Total: ₹{total}</h2>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => navigate("/shop")}
          className="bg-[#00b4d8] text-white px-6 py-2 rounded-lg hover:bg-[#0096c7] transition"
        >
          back to shop
        </button>
      </div>
    </div>
  );
};

export default Cart;