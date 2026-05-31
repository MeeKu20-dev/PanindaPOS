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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amountError, setAmountError] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name")
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
        unitPrice: item.unit_price,
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
    setLoading(true);

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const { data: trxData, error } = await supabase
      .from("transactions")
      .insert([
        {
          total,
          payment_method: paymentMethod,
          amount_paid: Number(amount),
          change: Number(amount) - total,
          created_by: profile?.id,
          created_by_name: profile?.display_name,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error || !trxData) {
      console.log("TRANSACTION ERROR:", error);
      setLoading(false);
      return;
    }

    const transactionItems = cart.map((item) => {
      const earningsPerItem = (item.price - item.unitPrice) * item.qty;

      return {
        transaction_id: trxData.id,
        product_name: item.name,
        price: item.price,
        quantity: item.qty,
        earning_per_item: item.price - item.unitPrice,
        total_earning: earningsPerItem,
        status: "Succeeded",
      };
    });

    await supabase.from("transaction_items").insert(transactionItems);

    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      await supabase
        .from("products")
        .update({ quantity: product.stock - item.qty })
        .eq("id", item.id);
    }

    setProducts((prev) =>
      prev.map((p) => {
        const sold = cart.find((c) => c.id === p.id);
        if (!sold) return p;

        return {
          ...p,
          stock: p.stock - sold.qty,
        };
      }),
    );

    setCart([]);
    setAmount("");
    setChange(Number(amount) - total);

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setShowConfirm(false);
    }, 1500);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

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
              <small>Stock: {p.stock}</small>
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
                <div className="cart-info">
                  <span className="cart-name">{item.name}</span>

                  <span>x{item.qty}</span>

                  <span className="cart-price">₱{item.price * item.qty}</span>
                </div>

                <div className="cart-actions">
                  <button
                    className="decrease-btn"
                    onClick={() => decreaseQty(item.id)}
                  >
                    -
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
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

          {amountError && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {amountError}
            </p>
          )}

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
              setAmountError("");

              if (cart.length === 0) {
                setAmountError(
                  "No items selected. Please add products to cart.",
                );
                return;
              }

              if (!amount) {
                setAmountError("Please enter payment amount");
                return;
              }

              const calc = Number(amount) - total;

              if (calc < 0) {
                setAmountError(
                  "Insufficient amount. Please enter enough payment.",
                );
                return;
              }

              setChange(calc);
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
            {loading ? (
              <>
                <h2>Processing...</h2>
              </>
            ) : success ? (
              <>
                <h2>Transaction Successful ✅</h2>
              </>
            ) : (
              <>
                <h2>Confirm Checkout</h2>

                <div className="modal-actions">
                  <button onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button onClick={saveTransaction}>Confirm</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
