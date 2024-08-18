import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../AuthContext/AuthContext";

const Navbar = () => {
  const { isLoggedIn, Logout } = useAuthContext();
  return (
    <div className="bg-gray-500 flex justify-end">
      <div className=" text-sm sm:text-xl text-white p-4 items-center">
        {isLoggedIn ? (
          <div>
            <button
              className="p-2 px-5 rounded mx-1 bg-red-500"
              onClick={() => Logout()}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `p-2 rounded mx-1 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `p-2 rounded mx-1 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="/reset-password"
              className={({ isActive }) =>
                `p-2 rounded mx-1 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              Reset Password
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
