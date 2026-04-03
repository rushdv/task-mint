// User routes - register, get profile, manage users (admin)
// Handled in index.js via usersCollection
// This file documents the user API endpoints:
//
// POST   /users           - Register new user (assigns default coins by role)
// GET    /users/me        - Get current logged-in user profile
// GET    /users           - Get all users (admin only)
// GET    /users/top-workers - Get top 6 workers by coins (public)
// PATCH  /users/role/:id  - Update user role (admin only)
// DELETE /users/:id       - Delete user (admin only)

module.exports = {};
