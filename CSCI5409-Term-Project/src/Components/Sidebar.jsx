import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-[30%] sm:w-[20%] text-sm sm:text-xl bg-gray-700 text-white flex flex-col min-h-screen">
      <div className="p-4 text-xl font-bold">Expense Tracker</div>
      <nav className="flex-1">
        <ul className="space-y-2 p-4">
          <li>
            <NavLink
              to="/add-expense"
              className={({ isActive }) =>
                `p-2 block ${isActive ? "bg-gray-500" : ""}`
              }
            >
              Add Expense
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/current-month-expense"
              className={({ isActive }) =>
                `p-2 block ${isActive ? "bg-gray-500" : ""}`
              }
            >
              Current Month Expense
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/previous-expenses"
              className={({ isActive }) =>
                `p-2 block ${isActive ? "bg-gray-500" : ""}`
              }
            >
              Previous Months Expenses
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
