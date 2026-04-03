require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

/* ========= MIDDLEWARE ========= */

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

/* ========= MONGODB ========= */

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/* ========= JWT VERIFY ========= */

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

/* ========= SERVER ========= */

async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected");

    const db = client.db("microTaskDB");

    const usersCol = db.collection("users");
    const tasksCol = db.collection("tasks");
    const submissionsCol = db.collection("submissions");
    const paymentsCol = db.collection("payments");
    const withdrawalsCol = db.collection("withdrawals");
    const notificationsCol = db.collection("notifications");

    /* ===== AUTH ===== */

    app.post("/jwt", async (req, res) => {
      const token = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.send({ token });
    });

    /* ===== USERS ===== */

    app.post("/users", async (req, res) => {
      const user = req.body;

      const exists = await usersCol.findOne({ email: user.email });

      if (exists) {
        return res.send({ message: "User exists", insertedId: null });
      }

      const coins = user.role === "buyer" ? 50 : 10;

      const result = await usersCol.insertOne({
        ...user,
        coins,
        createdAt: new Date(),
      });

      res.send(result);
    });

    app.get("/users/top-workers", async (req, res) => {
      const workers = await usersCol
        .find({ role: "worker" })
        .sort({ coins: -1 })
        .limit(6)
        .toArray();

      res.send(workers);
    });

    app.get("/users/me", verifyToken, async (req, res) => {
      const user = await usersCol.findOne({
        email: req.decoded.email,
      });

      res.send(user);
    });

    /* ===== ROOT ===== */

    app.get("/", (req, res) => {
      res.send("TaskMint Server Running 🚀");
    });
  } catch (err) {
    console.error(err);
  }
}

run();

/* ========= START ========= */

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

module.exports = app;