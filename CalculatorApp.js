// CalculatorApp.js

const express = require("express");
const app = express();
const port = 3000;
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const url = "mongodb://admin:password@localhost:32000/?authMechanism=DEFAULT";

const add = (n1, n2) => {
  return n1 + n2;
};

const subtract = (n1, n2) => {
  return n1 - n2;
};

const multiply = (n1, n2) => {
  return n1 * n2;
};

const divide = (n1, n2) => {
  if (n2 === 0) {
    throw new Error("Cannot divide by zero");
  }
  return n1 / n2;
};

app.get("/calculate", async (req, res) => {
  try {
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    const operation = req.query.operation;
    if (isNaN(n1)) {
      throw new Error("Invalid value for n1");
    }
    if (isNaN(n2)) {
      throw new Error("Invalid value for n2");
    }
    let result;
    switch (operation) {
      case "add":
        result = add(n1, n2);
        break;
      case "subtract":
        result = subtract(n1, n2);
        break;
      case "multiply":
        result = multiply(n1, n2);
        break;
      case "divide":
        result = divide(n1, n2);
        break;
      default:
        throw new Error("Invalid operation");
    }

    // Store the calculation result in MongoDB
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db("calculatordatabase");
    const calculations = db.collection("calculations");
    const resultObj = {
      n1,
      n2,
      operation,
      result,
      timestamp: new Date(),
    };
    await calculations.insertOne(resultObj);
    client.close();

    res.status(200).json({ Status: "Success", Statuscode: 200, Answer: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ Status: "Error", Statuscode: 400, Msg: error.message });
  }
});

// GET Calculations endpoint
app.get("/calculations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db("calculatordatabase");
    const calculations = db.collection("calculations");

    // use the ObjectId constructor with the new keyword
    const result = await calculations.findOne({ _id: new ObjectId(id) });

    client.close();
    if (!result) {
      throw new Error("Calculation not found");
    }
    res.status(200).json({ Status: "Success", Statuscode: 200, Calculation: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ Status: "Error", Statuscode: 400, Msg: error.message });
  }
});

// UPDATE Calculations endpoint
app.put("/calculations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db("calculatordatabase");
    const calculations = db.collection("calculations");

    // find the calculation by its id and update it
    const result = await calculations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnOriginal: false }
    );

    client.close();

    if (!result.value) {
      throw new Error("Calculation not found");
    }

    res.status(200).json({ Status: "Success", Statuscode: 200, Result: result.value });
  } catch (error) {
    console.error(error);
    res.status(400).json({ Status: "Error", Statuscode: 400, Msg: error.message });
  }
});

// DELETE Calculations endpoint
app.delete("/calculations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db("calculatordatabase");
    const calculations = db.collection("calculations");

    const result = await calculations.findOneAndDelete({ _id: new ObjectId(id) });

    client.close();
    if (!result.value) {
      throw new Error("Calculation not found");
    }
    res.status(200).json({ Status: "Success", Statuscode: 200, Calculation: result.value });
  } catch (error) {
    console.error(error);
    res.status(400).json({ Status: "Error", Statuscode: 400, Msg: error.message });
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
