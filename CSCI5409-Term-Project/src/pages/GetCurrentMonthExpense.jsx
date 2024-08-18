import React, { useEffect, useState } from "react";
import axios from "axios";
import ExpenseCard from "../Components/ExpenseCard";
import { useAuthContext } from "../AuthContext/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../config/backendURL";

const GetCurrentMonthExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false)
  const [noExpense, setNoExpense] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchExpenses = async () => {
      await axios
        .post(`${backendURL}/get-current-expense`, {
          useremail: user.email
        })
        .then((response) => {
          console.log(response);

          if(response.data.expenseList){
            setExpenses(response.data.expenseList);
          }else{
            setNoExpense(true)
          }
          
          setLoading(false);
        })
        .catch((error) => {
          setError(true)
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
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">
        Your Current Month Expense
      </h1>
      {
        noExpense ? <div className="font-serif">
            You have not added any expense for this month.
        </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-8">
        {expenses.map((expense, index) => (
          <ExpenseCard
            key={index}
            expenseName={expense.expenseName}
            expenseAmount={expense.amount}
            expenseImage={expense.expenseImageUrl}
          />
        ))}
      </div>
      }
      
    </div>
  );
};

export default GetCurrentMonthExpense;
