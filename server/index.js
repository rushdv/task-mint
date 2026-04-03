require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://task-mint.netlify.app',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.options('*', cors())
app.use(express.json());

// MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

// JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Forbidden' });
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const db = client.db('microTaskDB');
    const usersCollection = db.collection('users');
    const tasksCollection = db.collection('tasks');
    const submissionsCollection = db.collection('submissions');
    const paymentsCollection = db.collection('payments');
    const withdrawalsCollection = db.collection('withdrawals');
    const notificationsCollection = db.collection('notifications');

    // Role verify middlewares
    const verifyAdmin = async (req, res, next) => {
      const user = await usersCollection.findOne({ email: req.decoded.email });
      if (user?.role !== 'admin') return res.status(403).send({ message: 'Forbidden: Admin only' });
      next();
    };
    const verifyBuyer = async (req, res, next) => {
      const user = await usersCollection.findOne({ email: req.decoded.email });
      if (user?.role !== 'buyer') return res.status(403).send({ message: 'Forbidden: Buyer only' });
      next();
    };
    const verifyWorker = async (req, res, next) => {
      const user = await usersCollection.findOne({ email: req.decoded.email });
      if (user?.role !== 'worker') return res.status(403).send({ message: 'Forbidden: Worker only' });
      next();
    };

    // ─── AUTH ───────────────────────────────────────────────
    app.post('/jwt', async (req, res) => {
      const { email } = req.body;
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.send({ token });
    });

    // ─── USERS ──────────────────────────────────────────────
    app.post('/users', async (req, res) => {
      const user = req.body;
      const exists = await usersCollection.findOne({ email: user.email });
      if (exists) return res.send({ message: 'User already exists', insertedId: null });
      const coins = user.role === 'buyer' ? 50 : 10;
      const result = await usersCollection.insertOne({ ...user, coins, createdAt: new Date() });
      res.send(result);
    });

    app.get('/users/me', verifyToken, async (req, res) => {
      const user = await usersCollection.findOne({ email: req.decoded.email });
      res.send(user);
    });

    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.patch('/users/role/:id', verifyToken, verifyAdmin, async (req, res) => {
      const { role } = req.body;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role } }
      );
      res.send(result);
    });

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // Top 6 workers by coins
    app.get('/users/top-workers', async (req, res) => {
      const workers = await usersCollection
        .find({ role: 'worker' })
        .sort({ coins: -1 })
        .limit(6)
        .toArray();
      res.send(workers);
    });

    // ─── TASKS ──────────────────────────────────────────────
    app.post('/tasks', verifyToken, verifyBuyer, async (req, res) => {
      const task = req.body;
      const buyer = await usersCollection.findOne({ email: req.decoded.email });
      const totalCost = task.required_workers * task.payable_amount;
      if (buyer.coins < totalCost) {
        return res.status(400).send({ message: 'Insufficient coins' });
      }
      const result = await tasksCollection.insertOne({ ...task, createdAt: new Date() });
      await usersCollection.updateOne({ email: req.decoded.email }, { $inc: { coins: -totalCost } });
      res.send(result);
    });

    app.get('/tasks', verifyToken, async (req, res) => {
      const tasks = await tasksCollection.find({ required_workers: { $gt: 0 } }).toArray();
      res.send(tasks);
    });

    app.get('/tasks/buyer', verifyToken, verifyBuyer, async (req, res) => {
      const tasks = await tasksCollection
        .find({ buyer_email: req.decoded.email })
        .sort({ completion_date: -1 })
        .toArray();
      res.send(tasks);
    });

    app.get('/tasks/all', verifyToken, verifyAdmin, async (req, res) => {
      const tasks = await tasksCollection.find().toArray();
      res.send(tasks);
    });

    app.get('/tasks/:id', verifyToken, async (req, res) => {
      const task = await tasksCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(task);
    });

    app.patch('/tasks/:id', verifyToken, verifyBuyer, async (req, res) => {
      const { task_title, task_detail, submission_info } = req.body;
      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { task_title, task_detail, submission_info } }
      );
      res.send(result);
    });

    app.delete('/tasks/:id', verifyToken, async (req, res) => {
      const task = await tasksCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!task) return res.status(404).send({ message: 'Task not found' });
      const refill = task.required_workers * task.payable_amount;
      await usersCollection.updateOne(
        { email: task.buyer_email },
        { $inc: { coins: refill } }
      );
      const result = await tasksCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // ─── SUBMISSIONS ────────────────────────────────────────
    app.post('/submissions', verifyToken, verifyWorker, async (req, res) => {
      const submission = req.body;
      const result = await submissionsCollection.insertOne({
        ...submission,
        status: 'pending',
        current_date: new Date(),
      });
      // Notify buyer
      await notificationsCollection.insertOne({
        message: `${submission.worker_name} submitted for your task: ${submission.task_title}`,
        toEmail: submission.buyer_email,
        actionRoute: '/dashboard/buyer-home',
        time: new Date(),
      });
      res.send(result);
    });

    app.get('/submissions/worker', verifyToken, verifyWorker, async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const total = await submissionsCollection.countDocuments({ worker_email: req.decoded.email });
      const submissions = await submissionsCollection
        .find({ worker_email: req.decoded.email })
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send({ submissions, total, page, totalPages: Math.ceil(total / limit) });
    });

    app.get('/submissions/buyer', verifyToken, verifyBuyer, async (req, res) => {
      const tasks = await tasksCollection.find({ buyer_email: req.decoded.email }).toArray();
      const taskIds = tasks.map(t => t._id.toString());
      const submissions = await submissionsCollection
        .find({ task_id: { $in: taskIds }, status: 'pending' })
        .toArray();
      res.send(submissions);
    });

    app.patch('/submissions/:id/approve', verifyToken, verifyBuyer, async (req, res) => {
      const submission = await submissionsCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!submission) return res.status(404).send({ message: 'Not found' });
      await submissionsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: 'approved' } }
      );
      await usersCollection.updateOne(
        { email: submission.worker_email },
        { $inc: { coins: submission.payable_amount } }
      );
      await notificationsCollection.insertOne({
        message: `You earned ${submission.payable_amount} coins from ${submission.buyer_name} for completing ${submission.task_title}`,
        toEmail: submission.worker_email,
        actionRoute: '/dashboard/worker-home',
        time: new Date(),
      });
      res.send({ message: 'Approved' });
    });

    app.patch('/submissions/:id/reject', verifyToken, verifyBuyer, async (req, res) => {
      const submission = await submissionsCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!submission) return res.status(404).send({ message: 'Not found' });
      await submissionsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: 'rejected' } }
      );
      await tasksCollection.updateOne(
        { _id: new ObjectId(submission.task_id) },
        { $inc: { required_workers: 1 } }
      );
      await notificationsCollection.insertOne({
        message: `Your submission for ${submission.task_title} was rejected`,
        toEmail: submission.worker_email,
        actionRoute: '/dashboard/my-submissions',
        time: new Date(),
      });
      res.send({ message: 'Rejected' });
    });

    // Worker stats
    app.get('/submissions/worker/stats', verifyToken, verifyWorker, async (req, res) => {
      const email = req.decoded.email;
      const total = await submissionsCollection.countDocuments({ worker_email: email });
      const pending = await submissionsCollection.countDocuments({ worker_email: email, status: 'pending' });
      const approved = await submissionsCollection
        .find({ worker_email: email, status: 'approved' })
        .toArray();
      const totalEarning = approved.reduce((sum, s) => sum + s.payable_amount, 0);
      res.send({ total, pending, totalEarning });
    });

    // Buyer stats
    app.get('/tasks/buyer/stats', verifyToken, verifyBuyer, async (req, res) => {
      const email = req.decoded.email;
      const tasks = await tasksCollection.find({ buyer_email: email }).toArray();
      const taskCount = tasks.length;
      const pendingWorkers = tasks.reduce((sum, t) => sum + (t.required_workers || 0), 0);
      const payments = await paymentsCollection.find({ buyer_email: email }).toArray();
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      res.send({ taskCount, pendingWorkers, totalPaid });
    });

    // ─── PAYMENTS ───────────────────────────────────────────
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    app.post('/payments', verifyToken, async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne({ ...payment, date: new Date() });
      await usersCollection.updateOne(
        { email: req.decoded.email },
        { $inc: { coins: payment.coins } }
      );
      res.send(result);
    });

    app.get('/payments', verifyToken, async (req, res) => {
      const payments = await paymentsCollection
        .find({ buyer_email: req.decoded.email })
        .sort({ date: -1 })
        .toArray();
      res.send(payments);
    });

    // ─── WITHDRAWALS ────────────────────────────────────────
    app.post('/withdrawals', verifyToken, verifyWorker, async (req, res) => {
      const withdrawal = req.body;
      const user = await usersCollection.findOne({ email: req.decoded.email });
      if (user.coins < 200) return res.status(400).send({ message: 'Minimum 200 coins required' });
      const result = await withdrawalsCollection.insertOne({
        ...withdrawal,
        status: 'pending',
        withdraw_date: new Date(),
      });
      res.send(result);
    });

    app.get('/withdrawals/pending', verifyToken, verifyAdmin, async (req, res) => {
      const withdrawals = await withdrawalsCollection.find({ status: 'pending' }).toArray();
      res.send(withdrawals);
    });

    app.patch('/withdrawals/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
      const withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!withdrawal) return res.status(404).send({ message: 'Not found' });
      await withdrawalsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: 'approved' } }
      );
      await usersCollection.updateOne(
        { email: withdrawal.worker_email },
        { $inc: { coins: -withdrawal.withdrawal_coin } }
      );
      await notificationsCollection.insertOne({
        message: `Your withdrawal of $${withdrawal.withdrawal_amount} has been approved`,
        toEmail: withdrawal.worker_email,
        actionRoute: '/dashboard/withdrawals',
        time: new Date(),
      });
      res.send({ message: 'Withdrawal approved' });
    });

    // ─── NOTIFICATIONS ──────────────────────────────────────
    app.get('/notifications', verifyToken, async (req, res) => {
      const notifications = await notificationsCollection
        .find({ toEmail: req.decoded.email })
        .sort({ time: -1 })
        .toArray();
      res.send(notifications);
    });

    // ─── ADMIN STATS ────────────────────────────────────────
    app.get('/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
      const totalWorkers = await usersCollection.countDocuments({ role: 'worker' });
      const totalBuyers = await usersCollection.countDocuments({ role: 'buyer' });
      const allUsers = await usersCollection.find().toArray();
      const totalCoins = allUsers.reduce((sum, u) => sum + (u.coins || 0), 0);
      const payments = await paymentsCollection.find().toArray();
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      res.send({ totalWorkers, totalBuyers, totalCoins, totalPayments });
    });

    app.get('/', (req, res) => res.send('Micro Task Server Running'));

    await client.connect();
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
  }
}

run();

app.listen(port, () => console.log(`Server running on port ${port}`));
