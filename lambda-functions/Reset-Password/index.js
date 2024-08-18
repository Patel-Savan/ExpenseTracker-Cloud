const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));
const userTable = "Term-Project-Application-Users";
const resetPasswordTable = "Term-Project-Reset-Password-Code";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email = body.useremail.toLowerCase();

    if (!email) {
      return buildResponse(400, "Email is required");
    }

    const dbUser = await getUser(email);

    if (!dbUser || !dbUser.useremail) {
      return buildResponse(403, "Account does not exist for this email");
    }

    if (!dbUser.isSubscribed) {
      return buildResponse(403, "Please Confirm Subscription First");
    }

    let randomNumber = "";
    for (let i = 0; i < 6; i++) {
      randomNumber += Math.floor(Math.random() * 10).toString();
    }

    await sendCode(email, "Code for Resetting Password", randomNumber);

    await saveCode(email, randomNumber);

    const userInfo = {
      email: email
    };
    return buildResponse(200, userInfo);
  } catch (error) {
    console.error("Error updating user details:", error);
    return buildResponse(500, "Server error while updating user details");
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

const getUser = async (userEmail) => {
  const params = {
    TableName: userTable,
    Key: {
      useremail: userEmail
    }
  };

  return await dynamoDB.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      console.log(error);
      error.message;
    }
  );
};

const sendCode = async (useremail, subject, code) => {
  try {
    const message = `Use this Code for Resetting Password: ${code}`;
    await sns.send(
      new PublishCommand({
        Message: message,
        Subject: subject,
        TargetArn: process.env.SNS_ARN,
        MessageAttributes: {
          email: {
            DataType: "String",
            StringValue: useremail
          }
        }
      })
    );
  } catch (error) {
    console.log(error.message);
    throw Error(error.message);
  }
};

const saveCode = async (useremail, code) => {
  const params = {
    TableName: resetPasswordTable,
    Item: {
      useremail: useremail,
      code: code
    }
  };

  await dynamoDB.put(params).then(
    (response) => {
      return true;
    },
    (error) => {
      console.log(error);
      throw Error("Cannot Save Code");
    }
  );
};
