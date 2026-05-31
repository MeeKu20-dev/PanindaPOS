import { useEffect, useMemo, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import "./Reports.css";

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
       transaction_items (
  id,
  product_name,
  quantity,
  price,
  earning_per_item,
  total_earning,
  status
)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Fetch error:", error);
        return;
      }

      setTransactions(data || []);
    };

    fetchTransactions();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${month}-${day}-${year}, ${hours}:${minutes} ${ampm}`;
  };

  const monthLabel = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth);

    return date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth, selectedYear]);

  const reportLabel = useMemo(() => {
    if (filter === "daily") return "Daily";
    if (filter === "range") return "Range";
    return "Monthly";
  }, [filter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.created_at);

      if (filter === "daily") {
        const target = new Date(selectedDate);

        return (
          d.getDate() === target.getDate() &&
          d.getMonth() === target.getMonth() &&
          d.getFullYear() === target.getFullYear()
        );
      }

      if (filter === "range") {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return d >= start && d <= end;
      }

      // ✅ FIXED MONTHLY FILTER
      if (filter === "monthly") {
        return (
          d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
        );
      }

      return true;
    });
  }, [
    transactions,
    filter,
    selectedDate,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
  ]);

  const transactionItems = useMemo(() => {
    return filteredTransactions.flatMap((transaction) =>
      (transaction.transaction_items || []).map((item) => ({
        ...item,
        transactionId: transaction.id,
        created_at: transaction.created_at,
        cashier: transaction.created_by_name,
        amount_paid: transaction.amount_paid,
        transaction_total: transaction.total,
        change: transaction.change,
      })),
    );
  }, [filteredTransactions]);
  // MONTHLY SALES
  const sales = filteredTransactions.reduce((sum, t) => {
    const transactionTotal = (t.transaction_items || []).reduce(
      (itemSum, item) => {
        if (item.status === "Returned") return itemSum;

        return itemSum + Number(item.price || 0) * Number(item.quantity || 0);
      },
      0,
    );

    return sum + transactionTotal;
  }, 0);

  const profit = filteredTransactions.reduce((sum, t) => {
    const p = (t.transaction_items || []).reduce(
      (itemSum, item) =>
        item.status === "Returned"
          ? itemSum
          : itemSum + Number(item.total_earning || 0),
      0,
    );

    return sum + p;
  }, 0);

  const handleReturnItem = async (item) => {
    if (item.status === "Returned") return;

    const confirmReturn = window.confirm(`Return ${item.product_name}?`);

    if (!confirmReturn) return;

    try {
      // 1. UPDATE ITEM STATUS
      const { error: itemError } = await supabase
        .from("transaction_items")
        .update({ status: "Returned" })
        .eq("id", item.id);

      if (itemError) throw itemError;

      // 2. RESTORE STOCK
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("quantity")
        .eq("product_name", item.product_name)
        .single();

      if (fetchError) throw fetchError;

      const updatedStock =
        Number(product.quantity || 0) + Number(item.quantity || 0);

      const { error: stockError } = await supabase
        .from("products")
        .update({ quantity: updatedStock })
        .eq("product_name", item.product_name);

      if (stockError) throw stockError;

      // 3. UPDATE UI STATE
      setTransactions((prev) =>
        prev.map((t) => ({
          ...t,
          transaction_items: (t.transaction_items || []).map((i) =>
            i.id === item.id ? { ...i, status: "Returned" } : i,
          ),
        })),
      );

      alert("Item returned successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to return item");
    }
  };
  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports</h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="report-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="range">Date Range</option>
            <option value="monthly">Monthly</option>
          </select>

          {/* DAILY */}
          {filter === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="report-date"
            />
          )}

          {/* DATE RANGE */}
          {filter === "range" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="report-date"
              />

              <span>to</span>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="report-date"
              />
            </>
          )}

          {/* MONTHLY FILTER (FIXED) */}
          {filter === "monthly" && (
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="report-date"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="report-date"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TOP CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="report-cards">
          {/* SALES CARD */}
          <div className="report-card modern">
            <div className="report-left">
              <h2>₱{sales.toLocaleString()}</h2>
              <p className="label">{reportLabel} Sales</p>
              <span className="date">{monthLabel}</span>
            </div>

            <div className="report-right">
              <FaMoneyBillWave />
            </div>
          </div>

          {/* PROFIT CARD */}
          <div className="report-card modern profit">
            <div className="report-left">
              <h2>₱{profit.toLocaleString()}</h2>
              <p className="label">{reportLabel} Profit</p>
              <span className="date">{monthLabel}</span>
            </div>

            <div className="report-right">
              <FaMoneyBillWave />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="history-card">
        <h3>Transaction History</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cashier</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount Paid</th>
                <th>Total</th>
                <th>Change</th>
                <th>Profit</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {transactionItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactionItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.created_at)}</td>

                    <td>{item.cashier || "Unknown"}</td>

                    <td>{item.product_name}</td>

                    <td>{item.quantity}</td>

                    {/* Amount Paid from transaction */}
                    <td>₱{Number(item.amount_paid || 0).toLocaleString()}</td>

                    {/* Item Total */}
                    <td>
                      ₱
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toLocaleString()}
                    </td>

                    {/* Change from transaction */}
                    <td>₱{Number(item.change || 0).toLocaleString()}</td>

                    {/* Profit */}
                    <td
                      style={{
                        color: item.status === "Returned" ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      ₱{Number(item.total_earning || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td>
                      <div className="status-container">
                        <span
                          className={`status ${
                            item.status === "Returned" ? "returned" : "sold"
                          }`}
                        >
                          {item.status || "Sold"}
                        </span>

                        {/* SHOW BUTTON ONLY IF NOT RETURNED */}
                        {item.status !== "Returned" && (
                          <button
                            onClick={() => handleReturnItem(item)}
                            className="return-btn"
                          >
                            Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
