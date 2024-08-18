import React, { useState } from "react";
import { useAuthContext } from "../AuthContext/AuthContext";

const Login = () => {
  const { Login } = useAuthContext();

  const [userData, setUserData] = useState({
    useremail: "",
    userpassword: ""
  });
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (e) => {
    setPasswordError(false);
    e.preventDefault();

    const passwordRegex =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(userData.userpassword)) {
      setPasswordError(true);
    } else {
      await Login(userData);
    }
  };
  const handleReset = (e) => {
    e.preventDefault();

    setUserData({
      useremail: "",
      userpassword: ""
    });
    setPasswordError(false);
  };

  const handleChange = (e) => {
    e.preventDefault();

    const name = e.target.name;

    setUserData({
      ...userData,
      [name]: e.target.value
    });
  };
  return (
    <div className="w-[80%] h-[50%] sm:w-full sm:h-full flex justify-center items-center min-h-screen mx-auto">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-sml sm:text-2xl font-semibold mb-5 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="text-md sm:text-xl flex space-x-4">
            <button
              type="submit"
              className="w-full py-1 px-2 sm:py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
            >
              Login
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

export default Login;
