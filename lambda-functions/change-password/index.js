const { DynamoDBDocument, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const crypto = require("crypto");

const sns = new SNSClient({ region: "us-east-1" });
const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));
const userTable = "Term-Project-Application-Users";
const resetPasswordTable = "Term-Project-Reset-Password-Code";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const useremail = body.useremail;
    const password = body.userpassword;
    const code = body.verificationCode;

    const codeMatches = await verifyCode(useremail, code);

    if (!codeMatches) {
      return buildResponse(403, "Password Reset Code does not match");
    }

    const encryptPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await changePassword(useremail, encryptPassword);

    await deleteCode(useremail);

    await sendNotification(
      useremail,
      "Password Changed Successfully",
      `You have successfully changed the password on Expense Tracker for email ${useremail}`
    );
    return buildResponse(200, "Password Changed Successfully");
  } catch (error) {
    console.log(error);
    return buildResponse(500, "Server Error changing Password");
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

const deleteCode = async (useremail) => {
  const params = {
    TableName: resetPasswordTable,
    Key: {
      useremail: useremail
    }
  };

  const command = new DeleteCommand(params);

  try {
    const result = await dynamoDB.send(command);
    return result;
  } catch (error) {
    console.error(error);
    throw Error("Error deleting User");
  }
};

const verifyCode = async (useremail, code) => {
  const params = {
    TableName: resetPasswordTable,
    Key: {
      useremail: useremail
    }
  };
  let storedCode;
  await dynamoDB.get(params).then(
    (response) => {
      console.log(response);
      storedCode = response.Item.code;
    },
    (error) => {
      console.log(error);
      throw Error("Error checking Code");
    }
  );

  console.log(code);
  console.log(storedCode);
  return code === storedCode;
};

const changePassword = async (useremail, password) => {
  const params = {
    TableName: userTable,
    Key: {
      useremail: useremail
    },
    UpdateExpression: "set #attrName = :attrValue",
    ExpressionAttributeNames: {
      "#attrName": "password"
    },
    ExpressionAttributeValues: {
      ":attrValue": password
    },
    ReturnValues: "ALL_NEW"
  };

  return await dynamoDB.update(params).then(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error);
      throw Error("Error changing password");
    }
  );
};

const sendNotification = async (email, subject, message) => {
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_ARN,
        Message: message,
        Subject: subject,
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
  }
};
