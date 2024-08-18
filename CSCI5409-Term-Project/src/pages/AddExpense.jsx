import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuthContext } from "../AuthContext/AuthContext";
import { backendURL } from "../config/backendURL";

const AddExpense = () => {
  const [userData, setUserData] = useState({
    useremail: "",
    expenseName: "",
    expenseAmount: "",
    imageBase64: ""
  });
  const [numberError, setNumberError] = useState(false);
  const imageReference = useRef(null);

  const { user, isLoggedIn } = useAuthContext();
  useEffect(() => {
    console.log(user);
    console.log(isLoggedIn);
    if (user === null) {
      toast.success("Login First");
      navigate("/login");
    } else {
      setUserData({
        ...userData,
        useremail: user.email
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const name = e.target.name;

    setUserData({
      ...userData,
      [name]: e.target.value
    });
  };

  const handleReset = (e) => {
    e.preventDefault();

    setUserData({
      ...userData,
      expenseName: "",
      expenseAmount: "",
      imageBase64: ""
    });
  };

  const handleImage = (image) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = function (e) {
      const base64Image = e.target.result.substring(23);
      console.log(base64Image);
      setUserData({
        ...userData,
        imageBase64: base64Image
      });

      console.log(userData);
    };

    reader.onerror = function () {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setNumberError(false);

    const numberRegex = /^\d*$/;
    if (userData.expenseAmount === "" && userData.imageBase64 === "") {
      toast.error("You need to add any of expense Amount or Invoice Image");
    } else if (!numberRegex.test(userData.expenseAmount)) {
      setNumberError(true);
    } else {
      await axios
        .post(`${backendURL}/add-expense`, userData)
        .then((response) => {
          console.log(response);
          setUserData({
            ...userData,
            expenseName: "",
            expenseAmount: "",
            imageBase64: ""
          });
          imageReference.current.value = null;
          toast.success("Successfully added Expense");
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.body);
        });
    }
  };
  return (
    <div className="w-[80%] h-[50%] sm:w-full sm:h-full p-10 flex justify-center items-center min-h-screen mx-auto">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-sm sm:text-2xl font-semibold mb-5 text-center">
          Add Expense for this Month
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="expenseName"
              className="block text-sm font-medium text-gray-700"
            >
              Expense Name
            </label>
            <input
              type="text"
              name="expenseName"
              required
              value={userData.expenseName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="expenseAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Expense Amount
            </label>
            <input
              type="text"
              name="expenseAmount"
              value={userData.expenseAmount}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {numberError && (
              <p className="text-red-600 mt-2">* Amount can only be number</p>
            )}
          </div>

          <div>
            <label
              htmlFor="imageBase64"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Bill Image
            </label>
            <input
              type="file"
              name="imageBase64"
              ref={imageReference}
              onChange={(e) => handleImage(e.target.files[0])}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="text-md sm:text-xl flex space-x-4">
            <button
              type="submit"
              className="w-full py-1 px-2 sm:py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
            >
              Upload
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

export default AddExpense;
