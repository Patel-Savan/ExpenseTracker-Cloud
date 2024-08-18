const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));
const sns = new SNSClient({ region: "us-east-1" });

const tableName = "Term-Project-Expense-Table";

exports.handler = async (event) => {
  try {
    const users = await getAllUsers();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const promises = users.map(async (user) => {
      const { total, highestExpense, allExpenses } =
        await calculateTotalForMonth(user.expenses, currentMonth);
      await sendReportEmail(
        user.useremail,
        total,
        highestExpense,
        allExpenses,
        currentMonth
      );
    });

    await Promise.all(promises);
    return buildResponse(200, "Reports sent successfully.");
  } catch (error) {
    console.error("Error sending reports:", error);
    return buildResponse(500, "Server error while sending reports.");
  }
};

const getAllUsers = async () => {
  const params = {
    TableName: tableName
  };

  const scanResults = [];
  let items;
  let exclusiveStartKey;

  while (true) {
    items = await dynamoDB.scan(params);
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;

    if (!items.LastEvaluatedKey) {
      break;
    }
  }

  return scanResults;
};

const calculateTotalForMonth = async (expenses, monthKey) => {
  let total = 0;
  let highestExpense = { expenseName: "", amount: 0 };
  let allExpenses = [];

  if (expenses[monthKey]) {
    expenses[monthKey].forEach((expense) => {
      const amount = parseFloat(expense.amount);
      total += amount;
      allExpenses.push(expense);
      if (amount > highestExpense.amount) {
        highestExpense = expense;
      }
    });
  }

  return { total, highestExpense, allExpenses };
};

const sendReportEmail = async (
  email,
  total,
  highestExpense,
  allExpenses,
  monthKey
) => {
  try {
    const subject = "Your Monthly Expense Report";
    let expenseList = allExpenses
      .map((exp) => `${exp.expenseName}: ${exp.amount}`)
      .join("\n");
    const message = `You have spent a total amount of ${total} for the month of ${monthKey} until now. Your highest expense was ${highestExpense.amount} for ${highestExpense.expenseName}.\n\nHere is the list of all your expenses for this month:\n${expenseList}`;
    await sns.send(
      new PublishCommand({
        Message: message,
        Subject: subject,
        TargetArn: process.env.SNS_ARN,
        MessageAttributes: {
          email: {
            DataType: "String",
            StringValue: email
          }
        }
      })
    );
  } catch (error) {
    console.log(error.message);
    throw new Error("Error Sending Mail");
  }
};

const buildResponse = (statusCode, message) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  };
};
