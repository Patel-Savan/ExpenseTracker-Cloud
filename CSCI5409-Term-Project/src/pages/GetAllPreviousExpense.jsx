import React, { useEffect, useState } from "react";
import { useAuthContext } from "../AuthContext/AuthContext";
import axios from "axios";
import { backendURL } from "../config/backendURL";

const GetAllPreviousExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchExpenses = async () => {
      await axios
        .post(`${backendURL}/get-all-expense`, {
          useremail: user.email
        })
        .then((response) => {
          console.log(response);
          setExpenses(response.data);
          setLoading(false);
        })
        .catch((error) => {
          setError(true);
          console.log(error);
          toast.error(error.response.data);
        });
    };

    if (user == null) {
      toast.error("Login First");
      navigate("/login");
    } else {
      fetchExpenses();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expenses Table</h1>
      <table className="min-w-full w-[50%] bg-white">
        <thead>
          <tr>
            <th className="py-2 font-bold w-[40%] border border-gray-300">Month</th>
            <th className="py-2 font-bold w-[60%] border border-gray-300">Expense</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index} className="border-t">
              <td className="py-2 w-[40%] border border-gray-300 text-center">{expense.month}</td>
              <td className="py-2 w-[60%] border border-gray-300 text-center">{expense.expense}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetAllPreviousExpense;
