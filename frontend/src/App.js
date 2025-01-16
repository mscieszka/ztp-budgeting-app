import React, { useState } from "react";

const App = () => {
  const [formData, setFormData] = useState({
    transaction_date: "",
    title: "",
    is_income: true,
    spending: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_income" ? value === "true" : value, // Convert checkbox to boolean
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/transactions", {
        method: "POST",  // This should be POST
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
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction.");
    }
  };

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
    </div>
  );
};

export default App;
