// src/state/AppContext.js
import React, { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import axios from "axios";

// --- API Setup ---
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://budget-tracker-backend-lias.onrender.com/api",
});

// --- Initial State (empty, data will come from backend) ---
const initialState = {
  transactions: [],
  budgets: [],
  groups: [],
};

// --- Actions ---
const ACTIONS = {
  SET_DATA: "SET_DATA",

  ADD_TXN: "ADD_TXN",
  UPDATE_TXN: "UPDATE_TXN",
  DELETE_TXN: "DELETE_TXN",

  ADD_BUDGET: "ADD_BUDGET",
  UPDATE_BUDGET: "UPDATE_BUDGET",
  DELETE_BUDGET: "DELETE_BUDGET",

  ADD_GROUP: "ADD_GROUP",
  UPDATE_GROUP: "UPDATE_GROUP",
  DELETE_GROUP: "DELETE_GROUP",
};

// --- Reducer ---
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DATA:
      return { ...state, ...action.payload };

    // Transactions
    case ACTIONS.ADD_TXN:
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case ACTIONS.UPDATE_TXN:
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t._id === action.payload._id ? action.payload : t
        ),
      };
    case ACTIONS.DELETE_TXN:
      return { ...state, transactions: state.transactions.filter(t => t._id !== action.payload) };

    // Budgets
    case ACTIONS.ADD_BUDGET:
      return { ...state, budgets: [action.payload, ...state.budgets] };
    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b._id === action.payload._id ? action.payload : b
        ),
      };
    case ACTIONS.DELETE_BUDGET:
      return { ...state, budgets: state.budgets.filter(b => b._id !== action.payload) };

    // Groups
    case ACTIONS.ADD_GROUP:
      return { ...state, groups: [action.payload, ...state.groups] };
    case ACTIONS.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(g =>
          g._id === action.payload._id ? action.payload : g
        ),
      };
    case ACTIONS.DELETE_GROUP:
      return { ...state, groups: state.groups.filter(g => g._id !== action.payload) };

    default:
      return state;
  }
}

// --- Context Setup ---
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, budgetRes, groupRes] = await Promise.all([
          API.get("/transactions"),
          API.get("/budgets"),
          API.get("/groups"),
        ]);
        dispatch({
          type: ACTIONS.SET_DATA,
          payload: {
            transactions: txRes.data,
            budgets: budgetRes.data,
            groups: groupRes.data,
          },
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // --- CRUD Functions (call backend + update state) ---
  const addTransaction = async (txn) => {
    const res = await API.post("/transactions", txn);
    dispatch({ type: ACTIONS.ADD_TXN, payload: res.data });
  };
  const updateTransaction = async (id, txn) => {
    const res = await API.put(`/transactions/${id}`, txn);
    dispatch({ type: ACTIONS.UPDATE_TXN, payload: res.data });
  };
  const deleteTransaction = async (id) => {
    await API.delete(`/transactions/${id}`);
    dispatch({ type: ACTIONS.DELETE_TXN, payload: id });
  };

  const addBudget = async (budget) => {
    const res = await API.post("/budgets", budget);
    dispatch({ type: ACTIONS.ADD_BUDGET, payload: res.data });
  };
  const updateBudget = async (id, budget) => {
    const res = await API.put(`/budgets/${id}`, budget);
    dispatch({ type: ACTIONS.UPDATE_BUDGET, payload: res.data });
  };
  const deleteBudget = async (id) => {
    await API.delete(`/budgets/${id}`);
    dispatch({ type: ACTIONS.DELETE_BUDGET, payload: id });
  };

  const addGroup = async (group) => {
    const res = await API.post("/groups", group);
    dispatch({ type: ACTIONS.ADD_GROUP, payload: res.data });
  };
  const updateGroup = async (id, group) => {
    const res = await API.put(`/groups/${id}`, group);
    dispatch({ type: ACTIONS.UPDATE_GROUP, payload: res.data });
  };
  const deleteGroup = async (id) => {
    await API.delete(`/groups/${id}`);
    dispatch({ type: ACTIONS.DELETE_GROUP, payload: id });
  };

  // --- Totals (derived state) ---
  const totals = useMemo(() => {
    const income = state.transactions
      .filter(t => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const expense = state.transactions
      .filter(t => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { income, expense, savings: income - expense };
  }, [state.transactions]);

  const value = {
    state,
    dispatch,
    ACTIONS,
    totals,
    // CRUD Functions
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGroup, updateGroup, deleteGroup,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
