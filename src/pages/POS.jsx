import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import "./POS.css";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [change, setChange] = useState(null);
  const [cart, setCart] = useState([]);

  const [profile, setProfile] = useState(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(data);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("*");

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

  const addToCart = (product) => {
    if (product.stock <= 0) return;

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

  const saveTransaction = async () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const { data: trxData } = await supabase
      .from("transactions")
      .insert([
        {
          total,
          payment_method: paymentMethod,
          amount_paid: Number(amount),
          change: Number(amount) - total,
          created_by: profile?.id,
          created_by_name: profile?.display_name,
          created_by_role: profile?.role,
        },
      ])
      .select()
      .single();

    const transactionItems = cart.map((item) => ({
      transaction_id: trxData.id,
      product_name: item.name,
      price: item.price,
      quantity: item.qty,
    }));

    await supabase.from("transaction_items").insert(transactionItems);

    setCart([]);
    setAmount("");
    setChange(Number(amount) - total);
    setShowConfirm(false);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="pos-container">
      <div className="products">
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

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="checkout-input"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="checkout-select"
          >
            <option>Cash</option>
            <option>GCash</option>
          </select>

          {change !== null && (
            <div className="change-box">Change: ₱{change}</div>
          )}

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => {
              if (!amount) return;

              const calculatedChange = Number(amount) - total;

              if (calculatedChange < 0) return;

              setChange(calculatedChange);
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

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>

              <button onClick={saveTransaction}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
