import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {

  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  const fetchExpenses = async () => {
    const res = await axios.get("http://127.0.0.1:5000/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async () => {

    if (!item || !qty || !unitCost) {
      alert("Please fill all fields");
      return;
    }

    await axios.post("http://127.0.0.1:5000/add-expense", {
      item,
      qty: Number(qty),
      unit_cost: Number(unitCost)
    });

    setItem("");
    setQty("");
    setUnitCost("");

    fetchExpenses();
  };
  const chartData = {
  labels: expenses.map((e) => e.item),

  datasets: [
    {
      label: "Expense Total",
      data: expenses.map((e) => e.total),

      backgroundColor: darkMode
        ? "rgba(59,130,246,0.7)"
        : "rgba(37,99,235,0.7)",

      borderRadius: 10
    }
  ]
};
  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.total,
    0
  );

  return (
    <div
  style={{
    ...styles.page,
    background: darkMode ? "#0f172a" : "#f4f7fb",
    color: darkMode ? "white" : "black"
  }}
>

      {/* SIDEBAR */}
      <div
  style={{
    ...styles.sidebar,
    background: darkMode ? "#020617" : "#111827"
  }}
>
        <h2>🏨 Hostel Admin</h2>

        <div style={styles.menuItem}>📊 Dashboard</div>
        <div style={styles.menuItem}>💸 Expenses</div>
        <div style={styles.menuItem}>📦 Inventory</div>
        <div style={styles.menuItem}>📄 Reports</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>

        <div style={styles.header}>

  <h1 style={styles.title}>
    Expense Dashboard
  </h1>

  <button
    style={{
      ...styles.darkButton,
      background: darkMode ? "#facc15" : "#111827",
      color: darkMode ? "#111827" : "white"
    }}
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
  </button>

</div>

        {/* CARDS */}
        <div style={styles.cardContainer}>

          <div style={{
  ...styles.card,
  background: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black"
}}>
            <h3>Total Expenses</h3>
            <h2>{totalExpense.toLocaleString()} VND</h2>
          </div>

          <div style={{
  ...styles.card,
  background: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black"
}}>
            <h3>Total Records</h3>
            <h2>{expenses.length}</h2>
          </div>

          <div style={{
  ...styles.card,
  background: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black"
}}>
            <h3>Today</h3>
            <h2>{new Date().toLocaleDateString()}</h2>
          </div>

        </div>
{/* CHART */}

<div
  style={{
    ...styles.chartCard,
    background: darkMode ? "#1e293b" : "white",
    color: darkMode ? "white" : "black"
  }}
>

  <h2>Expense Analytics</h2>

  <Bar data={chartData} />

</div>
        {/* FORM */}
        <div style={{
  ...styles.formCard,
  background: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black"
}}>

          <h2>Add Expense</h2>

          <div style={styles.formGroup}>
            <input
              style={{
  ...styles.input,
  background: darkMode ? "#334155" : "white",
  color: darkMode ? "white" : "black",
  border: darkMode
    ? "1px solid #475569"
    : "1px solid #ddd"
}}
              placeholder="Item Name"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />

            <input
              style={{
  ...styles.input,
  background: darkMode ? "#334155" : "white",
  color: darkMode ? "white" : "black",
  border: darkMode
    ? "1px solid #475569"
    : "1px solid #ddd"
}}
              placeholder="Quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />

            <input
              style={{
  ...styles.input,
  background: darkMode ? "#334155" : "white",
  color: darkMode ? "white" : "black",
  border: darkMode
    ? "1px solid #475569"
    : "1px solid #ddd"
}}
              placeholder="Unit Cost"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />

            <button
              style={styles.button}
              onClick={addExpense}
            >
              Add Expense
            </button>

          </div>

        </div>

        {/* EXPORT BUTTON */}
        <a
          href="http://127.0.0.1:5000/export-excel"
          style={styles.exportButton}
        >
          ⬇ Export Excel
        </a>

        {/* TABLE */}
        <div style={{
  ...styles.tableCard,
  background: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black"
}}>

          <h2>Expense List</h2>

          <table style={styles.table}>

            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.id}</td>
                  <td>{expense.item}</td>
                  <td>{expense.qty}</td>
                  <td>{expense.unit_cost}</td>
                  <td>{expense.total}</td>
                  <td>{expense.date}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

const styles = {

  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial"
  },

  sidebar: {
    width: "250px",
    background: "#111827",
    color: "white",
    padding: "30px"
  },

  menuItem: {
    marginTop: "20px",
    padding: "12px",
    background: "#1f2937",
    borderRadius: "10px",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "30px"
  },

  title: {
    marginBottom: "20px"
  },

  cardContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    flex: 1,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },

  formCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },

  formGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    minWidth: "200px"
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer"
  },

  exportButton: {
    display: "inline-block",
    marginBottom: "20px",
    background: "#10b981",
    color: "white",
    padding: "12px 20px",
    borderRadius: "10px",
    textDecoration: "none"
  },

  tableCard: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },header: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
},

darkButton: {
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold"
},
chartCard: {
  padding: "25px",
  borderRadius: "15px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
}
  

};

export default App;