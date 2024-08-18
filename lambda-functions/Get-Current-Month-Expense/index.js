const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

const tableName = "Term-Project-Expense-Table";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email = body.useremail;

    const userDetails = await getUserDetails(email);

    if (!userDetails) {
      return buildResponse(200, "You have not added any expense");
    }

    const monthKey = new Date().toISOString().slice(0, 7);
    const expenseList = userDetails.expenses[monthKey];
    console.log(userDetails.expenses);
    console.log(expenseList);
    if (!expenseList) {
      return buildResponse(200, "You have not added any expenses this month");
    }

    const responseBody = {
      message: "Successfully Obtained Current Month Expense",
      expenseList: expenseList
    };
    return buildResponse(200, responseBody);
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
