import Layout from "../components/Layout";
import { FaMoneyBillWave } from "react-icons/fa";

// import { useMemo } from "react";
import "./Reports.css";

export default function Reports() {
  // SAMPLE DATA (replace later with real POS data)

  const transactions = [
    {
      date: "2026-05-01",
      items: ["Coke", "Bread"],
      total: 25,
    },
    {
      date: "2026-05-02",
      items: ["Noodles"],
      total: 12,
    },
  ];

  const monthlySales = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <Layout>
      <div className="reports-container">
        <h2>Reports</h2>

        {/* TOP CARD */}
        <div className="report-card">
          <div className="card-left">
            <FaMoneyBillWave />
          </div>

          <div className="card-right">
            <h3>Monthly Sales</h3>
            <p className="amount">₱{monthlySales}</p>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="reports-grid">
          {/* LEFT: TRANSACTIONS */}
          <div className="history-card">
            <h3>Transaction History</h3>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td>{t.items.join(", ")}</td>
                    <td>{t.items.length}</td>
                    <td>₱{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT: LOW STOCKS */}
          <div className="lowstock-card">
            <h3>Low Stocks</h3>

            <ul>
              {[
                { name: "Coke", stock: 5 },
                { name: "Bread", stock: 3 },
              ].map((item, i) => (
                <li key={i}>
                  <span>{item.name}</span>
                  <span className="low">{item.stock} left</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
