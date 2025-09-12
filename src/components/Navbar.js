import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">💸 Budget Tracker</div>
      <nav>
        <NavLink to="/dashboard" className="navlink">Dashboard</NavLink>
        <NavLink to="/transactions" className="navlink">Transactions</NavLink>
        <NavLink to="/budget" className="navlink">Budget</NavLink>
        <NavLink to="/groups" className="navlink">Groups</NavLink>
      </nav>
    </header>
  );
}
