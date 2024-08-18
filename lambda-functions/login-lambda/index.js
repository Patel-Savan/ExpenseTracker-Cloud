const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  SNSClient,
  PublishCommand,
  ListSubscriptionsByTopicCommand
} = require("@aws-sdk/client-sns");
const crypto = require("crypto");

const dynamoDb = DynamoDBDocument.from(
  new DynamoDB({
    region: "us-east-1"
  })
);
const sns = new SNSClient({ region: "us-east-1" });

const tableName = "Term-Project-Application-Users";

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  var email = body.useremail.toLowerCase();
  var password = body.userpassword;

  if (!email || !password) {
    return buildResponse(400, "Username and Password are Required");
  }

  const dbUser = await getUser(email);

  if (!dbUser || !dbUser.useremail) {
    return buildResponse(403, "Account does not exist for this email");
  }

  const encryptPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (encryptPassword != dbUser.password) {
    return buildResponse(403, "Password is incorrect");
  }

  try {
    console.log("Starting try block");
    if (!dbUser.isSubscribed) {
      console.log("Getting Subscription");
      const subArn = await findSubscriptionArnByEmail(email);
      if (subArn == "PendingConfirmation") {
        return buildResponse(
          403,
          "Confirm the Subscription from your email first."
        );
      } else {
        await updateUser(email);
      }
    }

    console.log("Sending Notification");
    await sendNotification(
      email,
      "You have Successfully Logges in to the Expense Tracker",
      "Login Confirmation."
    );

    const userInfo = {
      name: dbUser.username,
      email: dbUser.useremail
    };

    return buildResponse(200, userInfo);
  } catch (error) {
    console.log(error.message);
    return buildResponse(500, "Internal Server Error");
  }
};

const getUser = async (userEmail) => {
  const params = {
    TableName: tableName,
    Key: {
      useremail: userEmail
    }
  };

  return await dynamoDb.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      console.log(error);
      error.message;
    }
  );
};

const sendNotification = async (email, message, subject) => {
  try {
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
    throw Error(error.message);
  }
};

const buildResponse = (statusCode, message) => {
  const Response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "application/json"
    },
    body: JSON.stringify(message)
  };

  return Response;
};

const findSubscriptionArnByEmail = async (email) => {
  try {
    console.log(process.env.SNS_ARN);
    console.log("Inside Find Subscription Method");

    const data = await sns.send(
      new ListSubscriptionsByTopicCommand({ TopicArn: process.env.SNS_ARN })
    );

    console.log(data);
    const subscription = data.Subscriptions.find(
      (sub) => sub.Endpoint === email
    );

    console.log(subscription);
    if (subscription) {
      return subscription.SubscriptionArn;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error.message);
    throw Error("Error while getting Subscription");
  }
};

const updateUser = async (email) => {
  const params = {
    TableName: tableName,
    Key: {
      useremail: email
    },
    UpdateExpression: "set #attrName = :attrValue",
    ExpressionAttributeNames: {
      "#attrName": "isSubscribed"
    },
    ExpressionAttributeValues: {
      ":attrValue": true
    },
    ReturnValues: "ALL_NEW"
  };

  return await dynamoDb.update(params).then(
    (response) => {
      const res = {
        statusCode: 200,
        updatedItem: response.Item
      };
      return res;
    },
    (error) => {
      console.log(error);
      throw Error("Cannot Update Subscription");
    }
  );
};

