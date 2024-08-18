const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  SNSClient,
  SubscribeCommand,
  PublishCommand
} = require("@aws-sdk/client-sns");
const crypto = require("crypto");

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));
const sns = new SNSClient({ region: "us-east-1" });

const tableName = "Term-Project-Application-Users";

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const name = body.username;
  const email = body.useremail.toLowerCase();
  const password = body.userpassword;
  const income = body.income;

  if (!name || !email || !password || !income) {
    return buildResponse(400, "All the fields are required");
  }

  const dbUser = await getUser(email);

  if (dbUser && dbUser.useremail) {
    if (dbUser.isSubscribed)
      return buildResponse(400, "User already exist with this email");

    await deleteUser(email);
  }

  const encryptPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  try {
    const subscribeParams = {
      Protocol: "email",
      TopicArn: process.env.SNS_ARN,
      Endpoint: email,
      Attributes: { FilterPolicy: JSON.stringify({ email: [email] }) }
    };

    await sns.send(new SubscribeCommand(subscribeParams));

    const user = {
      useremail: email,
      username: name,
      password: encryptPassword,
      income: income,
      isSubscribed: false
    };

    await saveUser(user);

    return buildResponse(
      200,
      "User registered successfully. Please check your email and subscribe to get the Expense Reports."
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return buildResponse(500, "Server Error while saving user to database");
  }
};

const buildResponse = (statusCode, message) => {
  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "application/json"
    },
    body: JSON.stringify(message)
  };

  return response;
};

const getUser = async (useremail) => {
  const params = {
    TableName: tableName,
    Key: {
      useremail: useremail
    }
  };

  return await dynamoDB.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      return error.message;
    }
  );
};

const saveUser = async (user) => {
  const params = {
    TableName: tableName,
    Item: user
  };
  return await dynamoDB.put(params).then(
    (response) => {
      return true;
    },
    (error) => {
      throw error;
    }
  );
};

const deleteUser = async (useremail) => {
  const params = {
    TableName: tableName,
    Key: {
      useremail: useremail
    }
  };

  await dynamoDB.delete(params);
};
