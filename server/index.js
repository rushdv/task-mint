require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true, methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.options("*", cors());
app.use(express.json());

// MongoDB singleton
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db = null;
const getDB = async () => {
  if (!db) {
    await client.connect();
    db = client.db("microTaskDB");
    console.log("MongoDB Connected");
  }
  return db;
};

// DB middleware
app.use(async (req, res, next) => {
  try {
    req.db = await getDB();
    next();
  } catch (err) {
    res.status(500).send({ message: "DB connection failed" });
  }
});

// JWT middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: "Forbidden" });
    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const u = await req.db.collection("users").findOne({ email: req.decoded.email });
  if (u?.role !== "admin") return res.status(403).send({ message: "Admin only" });
  next();
};
const verifyBuyer = async (req, res, next) => {
  const u = await req.db.collection("users").findOne({ email: req.decoded.email });
  if (u?.role !== "buyer") return res.status(403).send({ message: "Buyer only" });
  next();
};
const verifyWorker = async (req, res, next) => {
  const u = await req.db.collection("users").findOne({ email: req.decoded.email });
  if (u?.role !== "worker") return res.status(403).send({ message: "Worker only" });
  next();
};

// ── AUTH
app.post("/jwt", async (req, res) => {
  const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.send({ token });
});

// ── USERS
app.post("/users", async (req, res) => {
  const usersCol = req.db.collection("users");
  const user = req.body;
  const exists = await usersCol.findOne({ email: user.email });
  if (exists) return res.send({ message: "User exists", insertedId: null });
  const coins = user.role === "buyer" ? 50 : 10;
  const result = await usersCol.insertOne({ ...user, coins, createdAt: new Date() });
  res.send(result);
});

app.get("/users/top-workers", async (req, res) => {
  const workers = await req.db.collection("users").find({ role: "worker" }).sort({ coins: -1 }).limit(6).toArray();
  res.send(workers);
});

app.get("/users/me", verifyToken, async (req, res) => {
  const user = await req.db.collection("users").findOne({ email: req.decoded.email });
  res.send(user);
});

app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await req.db.collection("users").find().toArray();
  res.send(users);
});

app.patch("/users/role/:id", verifyToken, verifyAdmin, async (req, res) => {
  const result = await req.db.collection("users").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { role: req.body.role } });
  res.send(result);
});

app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  const result = await req.db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
  res.send(result);
});

// ── TASKS
app.post("/tasks", verifyToken, verifyBuyer, async (req, res) => {
  const usersCol = req.db.collection("users");
  const tasksCol = req.db.collection("tasks");
  const task = req.body;
  const buyer = await usersCol.findOne({ email: req.decoded.email });
  const totalCost = task.required_workers * task.payable_amount;
  if (buyer.coins < totalCost) return res.status(400).send({ message: "Insufficient coins" });
  const result = await tasksCol.insertOne({ ...task, createdAt: new Date() });
  await usersCol.updateOne({ email: req.decoded.email }, { $inc: { coins: -totalCost } });
  res.send(result);
});

app.get("/tasks/buyer/stats", verifyToken, verifyBuyer, async (req, res) => {
  const tasks = await req.db.collection("tasks").find({ buyer_email: req.decoded.email }).toArray();
  const payments = await req.db.collection("payments").find({ buyer_email: req.decoded.email }).toArray();
  res.send({ taskCount: tasks.length, pendingWorkers: tasks.reduce((s, t) => s + (t.required_workers || 0), 0), totalPaid: payments.reduce((s, p) => s + p.amount, 0) });
});

app.get("/tasks/buyer", verifyToken, verifyBuyer, async (req, res) => {
  const tasks = await req.db.collection("tasks").find({ buyer_email: req.decoded.email }).sort({ completion_date: -1 }).toArray();
  res.send(tasks);
});

app.get("/tasks/all", verifyToken, verifyAdmin, async (req, res) => {
  const tasks = await req.db.collection("tasks").find().toArray();
  res.send(tasks);
});

app.get("/tasks", verifyToken, async (req, res) => {
  const tasks = await req.db.collection("tasks").find({ required_workers: { $gt: 0 } }).toArray();
  res.send(tasks);
});

app.get("/tasks/:id", verifyToken, async (req, res) => {
  const task = await req.db.collection("tasks").findOne({ _id: new ObjectId(req.params.id) });
  res.send(task);
});

app.patch("/tasks/:id", verifyToken, verifyBuyer, async (req, res) => {
  const { task_title, task_detail, submission_info } = req.body;
  const result = await req.db.collection("tasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { task_title, task_detail, submission_info } });
  res.send(result);
});

app.delete("/tasks/:id", verifyToken, async (req, res) => {
  const task = await req.db.collection("tasks").findOne({ _id: new ObjectId(req.params.id) });
  if (!task) return res.status(404).send({ message: "Not found" });
  await req.db.collection("users").updateOne({ email: task.buyer_email }, { $inc: { coins: task.required_workers * task.payable_amount } });
  const result = await req.db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) });
  res.send(result);
});

// ── SUBMISSIONS
app.post("/submissions", verifyToken, verifyWorker, async (req, res) => {
  const sub = req.body;
  const result = await req.db.collection("submissions").insertOne({ ...sub, status: "pending", current_date: new Date() });
  await req.db.collection("notifications").insertOne({ message: `${sub.worker_name} submitted for: ${sub.task_title}`, toEmail: sub.buyer_email, actionRoute: "/dashboard/buyer-home", time: new Date() });
  res.send(result);
});

app.get("/submissions/worker/stats", verifyToken, verifyWorker, async (req, res) => {
  const email = req.decoded.email;
  const subsCol = req.db.collection("submissions");
  const total = await subsCol.countDocuments({ worker_email: email });
  const pending = await subsCol.countDocuments({ worker_email: email, status: "pending" });
  const approved = await subsCol.find({ worker_email: email, status: "approved" }).toArray();
  res.send({ total, pending, totalEarning: approved.reduce((s, s2) => s + s2.payable_amount, 0) });
});

app.get("/submissions/worker", verifyToken, verifyWorker, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const email = req.decoded.email;
  const subsCol = req.db.collection("submissions");
  const total = await subsCol.countDocuments({ worker_email: email });
  const submissions = await subsCol.find({ worker_email: email }).skip((page - 1) * limit).limit(limit).toArray();
  res.send({ submissions, total, page, totalPages: Math.ceil(total / limit) });
});

app.get("/submissions/buyer", verifyToken, verifyBuyer, async (req, res) => {
  const tasks = await req.db.collection("tasks").find({ buyer_email: req.decoded.email }).toArray();
  const taskIds = tasks.map((t) => t._id.toString());
  const submissions = await req.db.collection("submissions").find({ task_id: { $in: taskIds }, status: "pending" }).toArray();
  res.send(submissions);
});

app.patch("/submissions/:id/approve", verifyToken, verifyBuyer, async (req, res) => {
  const sub = await req.db.collection("submissions").findOne({ _id: new ObjectId(req.params.id) });
  if (!sub) return res.status(404).send({ message: "Not found" });
  await req.db.collection("submissions").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "approved" } });
  await req.db.collection("users").updateOne({ email: sub.worker_email }, { $inc: { coins: sub.payable_amount } });
  await req.db.collection("notifications").insertOne({ message: `You earned ${sub.payable_amount} coins from ${sub.buyer_name} for ${sub.task_title}`, toEmail: sub.worker_email, actionRoute: "/dashboard/worker-home", time: new Date() });
  res.send({ message: "Approved" });
});

app.patch("/submissions/:id/reject", verifyToken, verifyBuyer, async (req, res) => {
  const sub = await req.db.collection("submissions").findOne({ _id: new ObjectId(req.params.id) });
  if (!sub) return res.status(404).send({ message: "Not found" });
  await req.db.collection("submissions").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "rejected" } });
  await req.db.collection("tasks").updateOne({ _id: new ObjectId(sub.task_id) }, { $inc: { required_workers: 1 } });
  await req.db.collection("notifications").insertOne({ message: `Your submission for ${sub.task_title} was rejected`, toEmail: sub.worker_email, actionRoute: "/dashboard/my-submissions", time: new Date() });
  res.send({ message: "Rejected" });
});

// ── PAYMENTS
app.post("/create-payment-intent", verifyToken, async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({ amount: req.body.amount * 100, currency: "usd", payment_method_types: ["card"] });
  res.send({ clientSecret: paymentIntent.client_secret });
});

app.post("/payments", verifyToken, async (req, res) => {
  const result = await req.db.collection("payments").insertOne({ ...req.body, date: new Date() });
  await req.db.collection("users").updateOne({ email: req.decoded.email }, { $inc: { coins: req.body.coins } });
  res.send(result);
});

app.get("/payments", verifyToken, async (req, res) => {
  const payments = await req.db.collection("payments").find({ buyer_email: req.decoded.email }).sort({ date: -1 }).toArray();
  res.send(payments);
});

// ── WITHDRAWALS
app.post("/withdrawals", verifyToken, verifyWorker, async (req, res) => {
  const user = await req.db.collection("users").findOne({ email: req.decoded.email });
  if (user.coins < 200) return res.status(400).send({ message: "Minimum 200 coins required" });
  const result = await req.db.collection("withdrawals").insertOne({ ...req.body, status: "pending", withdraw_date: new Date() });
  res.send(result);
});

app.get("/withdrawals/pending", verifyToken, verifyAdmin, async (req, res) => {
  const withdrawals = await req.db.collection("withdrawals").find({ status: "pending" }).toArray();
  res.send(withdrawals);
});

app.patch("/withdrawals/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  const w = await req.db.collection("withdrawals").findOne({ _id: new ObjectId(req.params.id) });
  if (!w) return res.status(404).send({ message: "Not found" });
  await req.db.collection("withdrawals").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "approved" } });
  await req.db.collection("users").updateOne({ email: w.worker_email }, { $inc: { coins: -w.withdrawal_coin } });
  await req.db.collection("notifications").insertOne({ message: `Your withdrawal of $${w.withdrawal_amount} has been approved`, toEmail: w.worker_email, actionRoute: "/dashboard/withdrawals", time: new Date() });
  res.send({ message: "Approved" });
});

// ── NOTIFICATIONS
app.get("/notifications", verifyToken, async (req, res) => {
  const notifications = await req.db.collection("notifications").find({ toEmail: req.decoded.email }).sort({ time: -1 }).toArray();
  res.send(notifications);
});

// ── ADMIN STATS
app.get("/admin/stats", verifyToken, verifyAdmin, async (req, res) => {
  const totalWorkers = await req.db.collection("users").countDocuments({ role: "worker" });
  const totalBuyers = await req.db.collection("users").countDocuments({ role: "buyer" });
  const allUsers = await req.db.collection("users").find().toArray();
  const totalCoins = allUsers.reduce((s, u) => s + (u.coins || 0), 0);
  const payments = await req.db.collection("payments").find().toArray();
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  res.send({ totalWorkers, totalBuyers, totalCoins, totalPayments });
});

app.get("/", (req, res) => res.send("TaskMint Server Running"));

app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
