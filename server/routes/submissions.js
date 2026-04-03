// Submission routes - worker task submissions and buyer review
//
// POST   /submissions                  - Submit task (worker only)
// GET    /submissions/worker           - Get worker's submissions (paginated)
// GET    /submissions/buyer            - Get pending submissions for buyer's tasks
// GET    /submissions/worker/stats     - Worker stats (total, pending, earnings)
// PATCH  /submissions/:id/approve      - Approve submission (buyer) - adds coins to worker
// PATCH  /submissions/:id/reject       - Reject submission (buyer) - increments required_workers

module.exports = {};
