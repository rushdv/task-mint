# 🪙 TaskMint - Micro Task & Earning Platform

A full-stack MERN application where users can complete micro-tasks and earn money.

## 🔗 Links

- **Live Site:** [https://taskmint.web.app](https://taskmint.web.app)
- **Client Repo:** [GitHub Client](https://github.com/yourusername/taskmint-client)
- **Server Repo:** [GitHub Server](https://github.com/yourusername/taskmint-server)

## 🔐 Admin Credentials

- **Email:** admin@taskmint.com
- **Password:** Admin@123

## ✨ Features

1. **Three Role System** — Worker, Buyer, and Admin each have dedicated dashboards with role-specific features
2. **Micro Task Marketplace** — Workers browse and complete tasks posted by Buyers to earn coins
3. **Coin Economy** — Workers earn coins per approved task; Buyers spend coins to post tasks
4. **Stripe Payment Integration** — Buyers can purchase coins securely using Stripe
5. **Submission Review System** — Buyers approve or reject worker submissions with instant coin transfers
6. **Withdrawal System** — Workers can withdraw earnings (min 200 coins = $10) via multiple payment methods
7. **Real-time Notifications** — Users receive in-app notifications for approvals, rejections, and withdrawals
8. **Firebase Authentication** — Email/password and Google Sign-In with JWT-secured API routes
9. **Image Upload with ImgBB** — Profile photos and task images uploaded via ImgBB API
10. **Fully Responsive** — Mobile, tablet, and desktop layouts including the dashboard
11. **Pagination** — Worker submissions page includes server-side pagination
12. **Admin Controls** — Admin can manage all users (update roles, delete) and all tasks

## 🛠 Tech Stack

**Frontend:** React, Vite, TailwindCSS, React Router, TanStack Query, Framer Motion, Swiper, Stripe.js, Firebase

**Backend:** Node.js, Express, MongoDB, JWT, Stripe

## 🚀 Getting Started

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

### Client
```bash
cd client
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

## 📁 Project Structure

```
/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── providers/
│       └── routes/
└── server/          # Express + MongoDB backend
    └── index.js
```
