require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

/* =====================
   MIDDLEWARE
===================== */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://task-mint.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

/* =====================
   MONGODB
===================== */

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/* =====================
   JWT VERIFY
===================== */

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden" });
    }

    req.decoded = decoded;
    next();
  });
};

/* =====================
   SERVER RUN
===================== */

async function run() {
  try {
    await client.connect();

    const db = client.db("microTaskDB");

    const usersCollection = db.collection("users");
    const tasksCollection = db.collection("tasks");
    const submissionsCollection = db.collection("submissions");
    const paymentsCollection = db.collection("payments");
    const withdrawalsCollection = db.collection("withdrawals");
    const notificationsCollection = db.collection("notifications");

    /* =====================
       ROLE VERIFY
    ===================== */

    const verifyAdmin = async (req, res, next) => {
      const user = await usersCollection.findOne({
        email: req.decoded.email,
      });

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Admin only" });
      }

      next();
    };

    const verifyBuyer = async (req, res, next) => {
      const user = await usersCollection.findOne({
        email: req.decoded.email,
      });

      if (user?.role !== "buyer") {
        return res.status(403).send({ message: "Buyer only" });
      }

      next();
    };

    const verifyWorker = async (req, res, next) => {
      const user = await usersCollection.findOne({
        email: req.decoded.email,
      });

      if (user?.role !== "worker") {
        return res.status(403).send({ message: "Worker only" });
      }

      next();
    };

    /* =====================
       JWT ROUTE
    ===================== */

    app.post("/jwt", async (req, res) => {
      const { email } = req.body;

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.send({ token });
    });

    /* =====================
       USERS
    ===================== */

    app.post("/users", async (req, res) => {
      const user = req.body;

      const existing = await usersCollection.findOne({
        email: user.email,
      });

      if (existing) {
        return res.send({ message: "User exists", insertedId: null });
      }

      const coins = user.role === "buyer" ? 50 : 10;

      const result = await usersCollection.insertOne({
        ...user,
        coins,
        createdAt: new Date(),
      });

      res.send(result);
    });

    app.get("/users/me", verifyToken, async (req, res) => {
      const user = await usersCollection.findOne({
        email: req.decoded.email,
      });

      res.send(user);
    });

    /* =====================
       TOP WORKERS
    ===================== */

    app.get("/users/top-workers", async (req, res) => {
      const workers = await usersCollection
        .find({ role: "worker" })
        .sort({ coins: -1 })
        .limit(6)
        .toArray();

      res.send(workers);
    });

    /* =====================
       TASK CREATE
    ===================== */

    app.post("/tasks", verifyToken, verifyBuyer, async (req, res) => {
      const task = req.body;

      const buyer = await usersCollection.findOne({
        email: req.decoded.email,
      });

      const totalCost = task.required_workers * task.payable_amount;

      if (buyer.coins < totalCost) {
        return res.status(400).send({
          message: "Insufficient coins",
        });
      }

      const result = await tasksCollection.insertOne({
        ...task,
        createdAt: new Date(),
      });

      await usersCollection.updateOne(
        { email: req.decoded.email },
        { $inc: { coins: -totalCost } }
      );

      res.send(result);
    });

    /* =====================
       TASK LIST
    ===================== */

    app.get("/tasks", verifyToken, async (req, res) => {
      const tasks = await tasksCollection
        .find({ required_workers: { $gt: 0 } })
        .toArray();

      res.send(tasks);
    });

    /* =====================
       PAYMENT INTENT
    ===================== */

    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const { amount } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    /* =====================
       ROOT
    ===================== */

    app.get("/", (req, res) => {
      res.send("TaskMint Server Running");
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
}

run();

/* =====================
   SERVER START
===================== */

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});