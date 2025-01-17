import React, { useState, useEffect } from "react";

const App = () => {
  const [formData, setFormData] = useState({
    transaction_date: "",
    title: "",
    is_income: true,
    spending: "",
  });

  const [summary, setSummary] = useState({
    total_income: 0,
    total_spending: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_income" ? value === "true" : value, // Zamiana na boolean
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert("Transaction added successfully: " + JSON.stringify(data));
      fetchSummary(); 
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction.");
    }
  };

  const fetchSummary = async () => {
    try {
      const incomeResponse = await fetch("http://localhost:8000/transactions/total_income");
      const spendingResponse = await fetch("http://localhost:8000/transactions/total_spending");
      const balanceResponse = await fetch("http://localhost:8000/transactions/balance");

      const incomeData = await incomeResponse.json();
      const spendingData = await spendingResponse.json();
      const balanceData = await balanceResponse.json();

      setSummary({
        total_income: incomeData.total_income,
        total_spending: spendingData.total_spending,
        balance: balanceData.balance,
      });
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch("http://localhost:8000/transactions");
    const data = await response.json();
    setTransactions(data);
  };

  const handleDelete = async (transactionId) => {
    try {
      const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Transaction deleted successfully!");
        fetchTransactions(); 
      } else {
        throw new Error(`Failed to delete transaction`);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Transaction Date:</label>
          <input
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Is Income:</label>
          <select name="is_income" value={formData.is_income} onChange={handleChange}>
            <option value="true">Income</option>
            <option value="false">Expense</option>
          </select>
        </div>
        <div>
          <label>Spending Amount:</label>
          <input
            type="number"
            name="spending"
            value={formData.spending}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        <button type="submit">Add Transaction</button>
      </form>

      {/* Podsumowanie */}
      <h3>Summary</h3>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>Total Income:</strong> {summary.total_income.toFixed(2)}
        </div>
        <div>
          <strong>Total Spending:</strong> {summary.total_spending.toFixed(2)}
        </div>
        <div>
          <strong>Balance:</strong> {summary.balance.toFixed(2)}
        </div>
      </div>

      {/* Historia transakcji */}
      <h3>Transaction Details</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Date</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Title</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Type</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Amount</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{transaction.transaction_date}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{transaction.title}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                {transaction.is_income ? "Income" : "Expense"}
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>${transaction.spending.toFixed(2)}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                <button onClick={() => handleDelete(transaction.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
