// src/pages/Budget.jsx
import React, { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";
import ProgressBar from "../components/ProgressBar";

const empty = { category: "", limit: "", month: "" };

export default function Budget() {
  const { state, addBudget, updateBudget, deleteBudget } = useApp();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  // Calculate spending by category (from transactions)
  const spendByCategory = useMemo(() => {
    const m = {};
    state.transactions
      .filter(t => t.type === "expense")
      .forEach(t => { m[t.category] = (m[t.category] || 0) + Number(t.amount || 0); });
    return m;
  }, [state.transactions]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      limit: Number(form.limit || 0),
    };
    if (!payload.category || !payload.month) {
      return alert("Category and Month are required.");
    }

    try {
      if (editingId) {
        await updateBudget(editingId, payload);
      } else {
        await addBudget(payload);
      }
      setForm(empty);
      setEditingId(null);
    } catch (err) {
      console.error("Budget error:", err);
      alert("Failed to save budget. Check console.");
    }
  };

  const onEdit = (b) => {
    setForm({ ...b, limit: String(b.limit) });
    setEditingId(b._id); // use MongoDB _id now
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this budget?")) {
      try {
        await deleteBudget(id);
        if (editingId === id) {
          setForm(empty);
          setEditingId(null);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <>
      <h1>Budget</h1>

      {/* Form */}
      <form className="card form-grid" onSubmit={onSubmit}>
        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Limit"
          value={form.limit}
          onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
        />
        <input
          type="month"
          value={form.month}
          onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
        />
        <button className="btn primary" type="submit">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button className="btn" type="button" onClick={() => { setForm(empty); setEditingId(null); }}>
            Cancel
          </button>
        )}
      </form>

      {/* List of Budgets */}
      <div className="grid-2 mt">
        {state.budgets.map(b => {
          const spent = spendByCategory[b.category] || 0;
          return (
            <div key={b._id} className="card">
              <div className="row-between">
                <h3>{b.category} — {b.month}</h3>
                <div>
                  <button className="btn" onClick={() => onEdit(b)}>Edit</button>
                  <button className="btn danger" onClick={() => onDelete(b._id)}>Delete</button>
                </div>
              </div>
              <div className="row-between">
                <div>Spent: ₹{Intl.NumberFormat("en-IN").format(spent)}</div>
                <div>Limit: ₹{Intl.NumberFormat("en-IN").format(b.limit)}</div>
              </div>
              <ProgressBar value={spent} max={b.limit} />
            </div>
          );
        })}
        {state.budgets.length === 0 && <div className="card">No budgets set</div>}
      </div>
    </>
  );
}
