// src/pages/Transactions.jsx
import React, { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";

const emptyForm = { type: "expense", category: "", amount: "", date: "", notes: "" };

export default function Transactions() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ type: "all", category: "", from: "", to: "" });

  // Collect categories dynamically
  const categories = useMemo(() => {
    const all = new Set(state.transactions.map(t => t.category));
    return ["Salary", "Food", "Transport", "Entertainment", ...Array.from(all)];
  }, [state.transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return state.transactions.filter(t => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      return true;
    });
  }, [state.transactions, filters]);

  // --- Form Submit ---
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount || 0),
    };
    if (!payload.category || !payload.date) return alert("Category and Date are required.");

    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await addTransaction(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Failed to save transaction. Check console.");
    }
  };

  const onEdit = (t) => {
    setForm({ ...t, amount: String(t.amount) });
    setEditingId(t._id); // use MongoDB _id now
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      try {
        await deleteTransaction(id);
        if (editingId === id) {
          setForm(emptyForm);
          setEditingId(null);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <>
      <h1>Transactions</h1>

      {/* Form */}
      <form className="card form-grid" onSubmit={onSubmit}>
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
        />

        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />

        <input
          placeholder="Notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        />

        <button type="submit" className="btn primary">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button type="button" className="btn" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
            Cancel
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="card mt">
        <div className="filters">
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="all">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          <button className="btn" onClick={() => setFilters({ type: "all", category: "", from: "", to: "" })}>Clear</button>
        </div>

        {/* Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Type</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id}>
                <td className={t.type === "income" ? "green" : "red"}>{t.type}</td>
                <td>{t.category}</td>
                <td>{Intl.NumberFormat("en-IN").format(t.amount)}</td>
                <td>{t.date}</td>
                <td>{t.notes}</td>
                <td>
                  <button className="btn" onClick={() => onEdit(t)}>Edit</button>
                  <button className="btn danger" onClick={() => onDelete(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>No transactions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
