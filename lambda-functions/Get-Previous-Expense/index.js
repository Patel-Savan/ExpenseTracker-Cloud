const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

const tableName = "Term-Project-Expense-Table";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    console.log(body);
    const email = body.useremail;
    console.log(email);
    const userDetails = await getUserDetails(email);

    if (!userDetails) {
      return buildResponse(400, "You have not added any expense");
    }
    const expenseList = userDetails.expenses;

    const result = [];
    for (const monthKey in expenseList) {
      const expenses = expenseList[monthKey];
      let total = 0;
      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        total += parseFloat(expense.amount);
      }
      result.push({
        month: monthKey,
        expense: total
      });
    }

    return buildResponse(200, result);
  } catch (error) {
    console.error("Error sending reports:", error);
    return buildResponse(500, "Server error while sending reports.");
  }
};

const getUserDetails = async (email) => {
  const params = {
    TableName: tableName,
    Key: {
      useremail: email
    }
  };

  try {
    const response = await dynamoDB.get(params);
    console.log(response);
    return response.Item;
  } catch (error) {
    console.log(error);
    throw new Error("Error getting User details");
  }
};

const buildResponse = (statusCode, message) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  };
};
