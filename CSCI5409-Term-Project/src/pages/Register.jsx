import React, { useState } from "react";
import { useAuthContext } from "../AuthContext/AuthContext";

const Register = () => {
  const { Register } = useAuthContext();
  const [userData, setUserData] = useState({
    useremail: "",
    username: "",
    userpassword: "",
    confirmpassword: "",
    income: ""
  });

  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();

    setUserData({
      useremail: "",
      username: "",
      userpassword: "",
      confirmpassword: "",
      income: ""
    });
    setPasswordError(false);
    setConfirmPasswordError(false);
  };

  const handleChange = (e) => {
    e.preventDefault();

    const name = e.target.name;

    setUserData({
      ...userData,
      [name]: e.target.value
    });
  };
  const handleSubmit = async (event) => {
    setConfirmPasswordError(false);
    setPasswordError(false);

    event.preventDefault();

    const passwordRegex =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(userData.userpassword)) {
      setPasswordError(true);
    } else if (userData.userpassword !== userData.confirmpassword) {
      setConfirmPasswordError(true);
    } else {
      await Register(userData);
    }
  };

  return (
    <div className="w-[80%] h-[50%] sm:w-full sm:h-full flex justify-center items-center min-h-screen mx-auto">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-sm sm:text-2xl font-semibold mb-5 text-center">
          Register Yourself to Expense Tracker
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="username"
              required
              value={userData.username}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="useremail"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="useremail"
              required
              value={userData.useremail}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="income"
              className="block text-sm font-medium text-gray-700"
            >
              Income
            </label>
            <input
              type="text"
              name="income"
              required
              value={userData.income}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="userpassword"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="userpassword"
              required
              value={userData.userpassword}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {passwordError && (
              <p className="text-red-600 mt-2">
                * Password should contain alphabets with one capital letter,
                numbers, and special characters, and should be more than 8
                characters long
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmpassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmpassword"
              required
              value={userData.confirmpassword}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {confirmPasswordError && (
              <p className="text-red-600 mt-2">
                * Password and Confirm Password should match
              </p>
            )}
          </div>

          <div className="text-md sm:text-xl flex space-x-4">
            <button
              type="submit"
              className="w-full py-1 px-2 sm:py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
            >
              Register
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="w-full py-1 px-2 sm:py-2 sm:px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
