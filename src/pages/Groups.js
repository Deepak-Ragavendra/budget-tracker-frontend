// src/pages/Groups.jsx
import React, { useMemo, useState } from "react";
import { useApp } from "../state/AppContext";

const newGroup = { name: "", membersCsv: "" };
const newExpense = { description: "", amount: "", payer: "", split: "equal", date: "" };
const newSettlement = { from: "", to: "", amount: "" };

export default function Groups() {
  const { state, addGroup, updateGroup, deleteGroup } = useApp();
  const [groupForm, setGroupForm] = useState(newGroup);
  const [expenseForm, setExpenseForm] = useState(newExpense);
  const [settleForm, setSettleForm] = useState(newSettlement);
  const [activeGroupId, setActiveGroupId] = useState(state.groups[0]?._id || null);

  const activeGroup = useMemo(
    () => state.groups.find(g => g._id === activeGroupId) || null,
    [state.groups, activeGroupId]
  );

  // --- Group Creation ---
  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name) return alert("Group name required");

    const members = groupForm.membersCsv.split(",").map(s => s.trim()).filter(Boolean);
    if (members.length === 0) return alert("At least one member");

    try {
      await addGroup({ name: groupForm.name, members, expenses: [], settlements: [] });
      setGroupForm(newGroup);
    } catch (err) {
      console.error("Add group error:", err);
    }
  };

  // --- Delete Group ---
  const handleDeleteGroup = async (id) => {
    if (window.confirm("Delete this group?")) {
      try {
        await deleteGroup(id);
        setActiveGroupId(null); // reset selection
      } catch (err) {
        console.error("Delete group error:", err);
      }
    }
  };

  // --- Add Expense ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeGroup) return alert("Select a group");
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.payer || !expenseForm.date) {
      return alert("Fill all expense fields");
    }

    const exp = {
      description: expenseForm.description,
      amount: Number(expenseForm.amount || 0),
      payer: expenseForm.payer,
      split: expenseForm.split,
      date: expenseForm.date,
    };

    try {
      await updateGroup(activeGroup._id, {
        ...activeGroup,
        expenses: [...activeGroup.expenses, exp],
      });
      setExpenseForm(newExpense);
    } catch (err) {
      console.error("Add expense error:", err);
    }
  };

  // --- Add Settlement ---
  const handleAddSettlement = async (e) => {
    e.preventDefault();
    if (!activeGroup) return alert("Select a group");
    if (!settleForm.from || !settleForm.to || !settleForm.amount) {
      return alert("Fill all settlement fields");
    }

    const st = { from: settleForm.from, to: settleForm.to, amount: Number(settleForm.amount || 0) };

    try {
      await updateGroup(activeGroup._id, {
        ...activeGroup,
        settlements: [...activeGroup.settlements, st],
      });
      setSettleForm(newSettlement);
    } catch (err) {
      console.error("Add settlement error:", err);
    }
  };

  // --- Balance Calculation ---
  const balances = useMemo(() => {
    if (!activeGroup) return {};
    const members = activeGroup.members;
    const bal = Object.fromEntries(members.map(m => [m, 0]));

    // expenses
    activeGroup.expenses.forEach(e => {
      const share = e.amount / members.length;
      members.forEach(m => (bal[m] -= share));
      bal[e.payer] += e.amount;
    });

    // settlements
    activeGroup.settlements.forEach(s => {
      bal[s.from] += s.amount;
      bal[s.to] -= s.amount;
    });

    return bal;
  }, [activeGroup]);

  return (
    <>
      <h1>Groups</h1>

      <div className="grid-2">
        {/* Left side: Create + Select + Add forms */}
        <div className="card">
          <h3>Create Group</h3>
          <form onSubmit={handleAddGroup} className="form-grid">
            <input
              placeholder="Group name"
              value={groupForm.name}
              onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Members (comma separated)"
              value={groupForm.membersCsv}
              onChange={e => setGroupForm(f => ({ ...f, membersCsv: e.target.value }))}
            />
            <button className="btn primary">Add Group</button>
          </form>

          <h3 className="mt">Select Group</h3>
          <select
            className="w100"
            value={activeGroupId || ""}
            onChange={e => setActiveGroupId(e.target.value)}
          >
            <option value="" disabled>Select a group</option>
            {state.groups.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          {/* Delete Group Button */}
          {activeGroup && (
            <button
              className="btn danger mt"
              onClick={() => handleDeleteGroup(activeGroup._id)}
            >
              Delete Group
            </button>
          )}

          {activeGroup && (
            <>
              <h3 className="mt">Add Expense</h3>
              <form onSubmit={handleAddExpense} className="form-grid">
                <input
                  placeholder="Description"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                />
                <select
                  value={expenseForm.payer}
                  onChange={e => setExpenseForm(f => ({ ...f, payer: e.target.value }))}
                >
                  <option value="">Payer</option>
                  {activeGroup.members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={expenseForm.split}
                  onChange={e => setExpenseForm(f => ({ ...f, split: e.target.value }))}
                >
                  <option value="equal">Equal</option>
                </select>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))}
                />
                <button className="btn primary">Add</button>
              </form>

              <h3 className="mt">Record Settlement</h3>
              <form onSubmit={handleAddSettlement} className="form-grid">
                <select
                  value={settleForm.from}
                  onChange={e => setSettleForm(f => ({ ...f, from: e.target.value }))}
                >
                  <option value="">From</option>
                  {activeGroup.members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  value={settleForm.to}
                  onChange={e => setSettleForm(f => ({ ...f, to: e.target.value }))}
                >
                  <option value="">To</option>
                  {activeGroup.members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={settleForm.amount}
                  onChange={e => setSettleForm(f => ({ ...f, amount: e.target.value }))}
                />
                <button className="btn">Settle</button>
              </form>
            </>
          )}
        </div>

        {/* Right side: Balances + Tables */}
        <div className="card">
          <h3>Balances</h3>
          {!activeGroup && <div>Select a group to see balances.</div>}
          {activeGroup && (
            <table className="table">
              <thead><tr><th>Member</th><th>Balance</th></tr></thead>
              <tbody>
                {activeGroup.members.map(m => (
                  <tr key={m}>
                    <td>{m}</td>
                    <td className={balances[m] >= 0 ? "green" : "red"}>
                      {Intl.NumberFormat("en-IN").format(balances[m])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeGroup && (
            <>
              <h3 className="mt">Expenses</h3>
              <table className="table">
                <thead><tr><th>Date</th><th>Description</th><th>Payer</th><th>Amount</th></tr></thead>
                <tbody>
                  {activeGroup.expenses.map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td>
                      <td>{e.description}</td>
                      <td>{e.payer}</td>
                      <td>{Intl.NumberFormat("en-IN").format(e.amount)}</td>
                    </tr>
                  ))}
                  {activeGroup.expenses.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: "center" }}>No expenses</td></tr>
                  )}
                </tbody>
              </table>

              <h3 className="mt">Settlements</h3>
              <table className="table">
                <thead><tr><th>From</th><th>To</th><th>Amount</th></tr></thead>
                <tbody>
                  {activeGroup.settlements.map((s, i) => (
                    <tr key={i}>
                      <td>{s.from}</td>
                      <td>{s.to}</td>
                      <td>{Intl.NumberFormat("en-IN").format(s.amount)}</td>
                    </tr>
                  ))}
                  {activeGroup.settlements.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: "center" }}>No settlements</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
