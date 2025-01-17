import React, { useState, useEffect } from "react";
import './TransactionForm.css';
import './TransactionSummary.css';

const host = "http://localhost:8080";

const App = () => {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split("T")[0], // Default to today's date
    title: "",
    is_income: true,
    spending: 50,
  });

  const [summary, setSummary] = useState({
    total_income: 0,
    total_spending: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    type: "", // 'success' or 'error'
  });

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
      const response = await fetch(host + "/transactions", {
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
      
      setNotification({
        message: "Transaction added successfully!",
        type: "success",
      });

      fetchSummary();
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      setNotification({
        message: "Failed to add transaction.",
        type: "error",
      });
    }
  };

  const fetchSummary = async () => {
    try {
      const incomeResponse = await fetch(host + "/transactions/total_income");
      const spendingResponse = await fetch(host + "/transactions/total_spending");
      const balanceResponse = await fetch(host + "/transactions/balance");

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
    const response = await fetch(host + "/transactions");
    const data = await response.json();
    setTransactions(data);
  };

  const handleDelete = async (transactionId) => {
    try {
      const response = await fetch(host + `/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotification({
          message: "Transaction deleted successfully!",
          type: "success",
        });
        fetchTransactions();
        fetchSummary();
      } else {
        throw new Error(`Failed to delete transaction`);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setNotification({
        message: "Failed to delete transaction.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  return (
    <div>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ message: "", type: "" })}>X</button>
        </div>
      )}

      <div className="form-container">
        <h3>Add Transaction</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transaction Date</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select 
              name="is_income" 
              value={formData.is_income} 
              onChange={handleChange}
            >
              <option value="false">Expense</option>
              <option value="true">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="spending"
              value={formData.spending}
              onChange={handleChange}
              required
              min="0"
              step="0.01" // Changed to allow decimal values
            />
          </div>

          <button type="submit">Add Transaction</button>
        </form>
      </div>

      {/* Summary Section */}
      <div className="summary-container">
        <section className="summary-section">
          <h3>Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Income</span>
              <span className="summary-value income">${summary.total_income.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Spending</span>
              <span className="summary-value expense">${summary.total_spending.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Balance</span>
              <span className={`summary-value ${summary.balance >= 0 ? 'income' : 'expense'}`}>
                ${summary.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Transactions Table */}
        <section className="transactions-section">
          <h3>Transaction Details</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.transaction_date}</td>
                    <td>{transaction.title}</td>
                    <td>
                      <span className={`transaction-type ${transaction.is_income ? 'income' : 'expense'}`}>
                        {transaction.is_income ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className={transaction.is_income ? 'income' : 'expense'}>
                      ${transaction.spending.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
