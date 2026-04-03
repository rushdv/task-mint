const { MongoClient, ServerApiVersion } = require('mongodb');

// Role-based authorization middleware factory
// Usage: verifyRole(db, 'admin') | verifyRole(db, 'buyer') | verifyRole(db, 'worker')
const verifyRole = (usersCollection, role) => async (req, res, next) => {
  const user = await usersCollection.findOne({ email: req.decoded.email });
  if (user?.role !== role) {
    return res.status(403).send({ message: `Forbidden: ${role} access only` });
  }
  next();
};

module.exports = verifyRole;
