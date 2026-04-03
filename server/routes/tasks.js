// Task routes - CRUD for tasks
// Handled in index.js via tasksCollection
//
// POST   /tasks           - Create task (buyer only, deducts coins)
// GET    /tasks           - Get available tasks (required_workers > 0)
// GET    /tasks/buyer     - Get buyer's own tasks (buyer only)
// GET    /tasks/all       - Get all tasks (admin only)
// GET    /tasks/:id       - Get single task details
// PATCH  /tasks/:id       - Update task title/detail/submission_info (buyer only)
// DELETE /tasks/:id       - Delete task and refund coins (buyer/admin)
// GET    /tasks/buyer/stats - Get buyer dashboard stats

module.exports = {};
