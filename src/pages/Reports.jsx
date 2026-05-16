import { useEffect, useState } from "react";

import { FaMoneyBillWave } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import "./Reports.css";

export default function Reports() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Fetch error:", error);
        return;
      }

      setTransactions(data || []);
    };

    fetchTransactions();
  }, []);

  // MONTHLY SALES
  const monthlySales = transactions
    .filter((t) => {
      const d = new Date(t.created_at);

      return (
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.total), 0);

  return (
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
        {/* TRANSACTION HISTORY */}
        <div className="history-card">
          <h3>Transaction History</h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment</th>
                <th>Paid</th>
                <th>Total</th>
                <th>Change</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.created_at).toLocaleString()}</td>

                    <td>{t.payment_method}</td>

                    <td>₱{Number(t.amount_paid)}</td>

                    <td>₱{Number(t.total)}</td>
                    <td>₱{Number(t.change)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* LOW STOCK (STATIC FOR NOW) */}
        <div className="lowstock-card">
          <h3>Low Stocks</h3>

          <ul>
            <li>
              <span>Coke</span>
              <span className="low">5 left</span>
            </li>

            <li>
              <span>Bread</span>
              <span className="low">3 left</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
