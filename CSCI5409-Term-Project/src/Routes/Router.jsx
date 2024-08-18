import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPasswordCode from "../pages/ResetPasswordCode";
import ChangePassword from "../pages/ChangePassword";
import NotFoundPage from "../Components/NotFoundPage";
import PrivateRoutes from "./PrivateRoutes";
import AddExpense from "../pages/AddExpense";
import GetCurrentMonthExpense from "../pages/GetCurrentMonthExpense";
import GetAllPreviousExpense from "../pages/GetAllPreviousExpense";

const Router = () => {
  return (
    <div className="bg-zinc-200 flex flex-col min-h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPasswordCode />} />
            <Route path="/change-password" element={<ChangePassword />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/add-expense" element={<AddExpense />} />
              <Route
                path="/current-month-expense"
                element={<GetCurrentMonthExpense />}
              />
              <Route
                path="/previous-expenses"
                element={<GetAllPreviousExpense />}
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Router;
