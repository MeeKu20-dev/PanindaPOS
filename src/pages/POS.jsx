import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";
import "./POS.css";

export default function POS() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [change, setChange] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.log(error);
        return;
      }

      const formatted = (data || []).map((item) => ({
        id: item.id,
        name: item.product_name,
        price: item.selling_price,
        stock: item.quantity,
        category: item.category,
      }));

      setProducts(formatted);
    };

    loadProducts();
  }, []);

  // ADD TO CART
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert("Out of stock");
      return;
    }

    setChange(null);

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // CALCULATE TOTAL
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Layout>
      <div className="pos-container">
        {/* LEFT: PRODUCTS */}
        <div className="products">
          {/* SEARCH BAR */}
          <input
            type="text"
            placeholder="Search product..."
            className="search-bar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => addToCart(p)}
              >
                <h3>{p.name}</h3>
                <p>₱{p.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="cart">
          <h2 className="section-title">Cart</h2>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty">No items yet</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <span>{item.name}</span>
                  <span>x{item.qty}</span>
                  <span>₱{item.price * item.qty}</span>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <h3>Total: ₱{total}</h3>

            {/* PAYMENT INPUT */}
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="checkout-input"
            />

            {/* PAYMENT METHOD */}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="checkout-select"
            >
              <option>Cash</option>
              <option>GCash</option>
            </select>

            {/* CHANGE */}
            {change !== null && (
              <div className="change-box">Change: ₱{change}</div>
            )}

            {/* CHECKOUT BUTTON */}
            <button
              className="checkout-btn"
              disabled={cart.length === 0}
              onClick={() => {
                if (!amount) {
                  alert("Please enter payment amount");
                  return;
                }

                const calculatedChange = Number(amount) - total;

                if (calculatedChange < 0) {
                  alert("Insufficient amount");
                  return;
                }

                setPendingCheckout({
                  amount: Number(amount),
                  paymentMethod,
                  change: calculatedChange,
                });

                setShowConfirm(true);
              }}
            >
              Checkout
            </button>
          </div>
        </div>
        {showConfirm && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h2>Confirm Checkout</h2>

              <p className="confirm-text">
                Do you want to proceed with the transaction?
              </p>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="confirm-btn"
                  onClick={() => {
                    if (!pendingCheckout) return;

                    setCart([]);
                    setAmount("");
                    setChange(pendingCheckout.change);

                    setShowConfirm(false);
                    setPendingCheckout(null);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
