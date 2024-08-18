import React from "react";

const ExpenseCard = ({ expenseName, expenseImage, expenseAmount }) => {
  const defaultImage =
    "https://term-project-expense-tracker-bucket.s3.amazonaws.com/DefaultExpenseImage.jpg";

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-md cursor-pointer">
      <div className="relative">
        <img
          src={expenseImage || defaultImage}
          alt={expenseName}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="px-4 py-4">
        <h3 className="text-lg font-semibold">{expenseName}</h3>
        <p className="text-gray-600">${expenseAmount}</p>
      </div>
    </div>
  );
};

export default ExpenseCard;
