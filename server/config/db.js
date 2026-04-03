const { MongoClient, ServerApiVersion } = require('mongodb');

let db = null;

const connectDB = async () => {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  db = client.db('microTaskDB');
  console.log('MongoDB connected successfully');
  return db;
};

module.exports = connectDB;
