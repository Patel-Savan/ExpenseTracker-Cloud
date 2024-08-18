const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const {
  TextractClient,
  AnalyzeDocumentCommand
} = require("@aws-sdk/client-textract");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));
const textract = new TextractClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });
const sns = new SNSClient({ region: "us-east-1" });

const tableName = "Term-Project-Expense-Table";
const bucketName = "term-project-expense-tracker-bucket";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    let { useremail, expenseName, imageBase64, expenseAmount } = body;

    const monthKey = new Date().toISOString().slice(0, 7);

    if (!expenseAmount && !imageBase64) {
      return buildResponse(
        400,
        "Any one of expense amount or bill image is required"
      );
    }
    if (!useremail || !expenseName) {
      return buildResponse(400, "Email and expense name are required");
    }

    let imageBuffer,
      s3Key,
      encodedEmail,
      imageUrl = "";

    if (imageBase64) {
      imageBuffer = Buffer.from(imageBase64, "base64");
      s3Key = `${useremail}/${monthKey}/${expenseName}.jpg`;

      encodedEmail = encodeURIComponent(useremail);
      imageUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${encodedEmail}/${monthKey}/${expenseName}.jpg`;
      console.log("Inside upload image");
      await uploadImageToS3(imageBuffer, s3Key);
    }

    const dbItem = await getExpense(useremail);
    if (!dbItem || !dbItem.useremail) {
      await addExpense(useremail);
    }

    if (!expenseAmount) {
      const textractResponse = await analyzeDocument(imageBuffer);

      console.log("Inside extract amount");
      const extractedExpense = extractExpenseDetails(textractResponse);
      if (!extractedExpense) {
        return buildResponse(400, "Failed to extract expense details.");
      }

      expenseAmount = extractedExpense;
    }

    const expenseDetails = {
      expenseName: expenseName,
      amount: expenseAmount,
      expenseImageUrl: imageUrl
    };

    await updateExpense(useremail, monthKey, expenseDetails);

    const message = `Expense ${expenseAmount} has been added for ${expenseName} to your Expense tracker.`;
    await sendNotification(useremail, message, "Expense Added");

    return buildResponse(200, "Expense added successfully.");
  } catch (error) {
    console.error("Error processing expense:", error);
    return buildResponse(500, "Server error while processing expense.");
  }
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

const uploadImageToS3 = async (imageBuffer, key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/jpeg"
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    console.log(error);
    throw Error("Error uploading image to S3");
  }
};

const analyzeDocument = async (imageBuffer) => {
  const params = {
    Document: { Bytes: imageBuffer },
    FeatureTypes: ["TABLES", "FORMS"]
  };
  const command = new AnalyzeDocumentCommand(params);
  const response = await textract.send(command);
  return response;
};

const extractExpenseDetails = (textractResponse) => {
  let totalAmount = null;

  let blocks = textractResponse.Blocks;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.BlockType === "LINE") {
      const text = block.Text;
      console.log(text);

      const totalRegex = /^Total\s*:?\s*$/i;

      if (totalRegex.test(text)) {
        i++;
        while (blocks[i].BlockType != "LINE") {
          console.log(blocks[i]);
          i++;
        }
        const currentBlock = blocks[i].Text;
        console.log(currentBlock);
        if (currentBlock.includes("$")) {
          totalAmount = currentBlock.replace(/^\$/, "");
          console.log("Inside last if");
          console.log(totalAmount);
        } else {
          totalAmount = currentBlock;
        }
        if (totalAmount) {
          break;
        }
      }
    }
  }

  if (!totalAmount) {
    throw new Error("Failed to extract the total amount from the document.");
  }

  return totalAmount;
};

const addExpense = async (useremail) => {
  const params = {
    TableName: tableName,
    Item: {
      useremail: useremail,
      expenses: {}
    }
  };
  return await dynamoDB.put(params).then(
    (response) => {
      return true;
    },
    (error) => {
      console.log(error);
      throw Error("Error while adding new Expense");
    }
  );
};

const getExpense = async (userEmail) => {
  const params = {
    TableName: tableName,
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
      throw Error("Error while getting Expense details");
    }
  );
};

const updateExpense = async (userEmail, monthKey, expense) => {
  const params = {
    TableName: tableName,
    Key: { useremail: userEmail },
    UpdateExpression: `SET expenses.#monthKey = list_append(if_not_exists(expenses.#monthKey, :emptyList), :expense)`,
    ExpressionAttributeNames: {
      "#monthKey": monthKey
    },
    ExpressionAttributeValues: {
      ":expense": [expense],
      ":emptyList": []
    }
  };

  return await dynamoDB.update(params).then(
    (response) => {
      return true;
    },
    (error) => {
      console.log(error);
      throw Error("Error while updating expense list");
    }
  );
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
