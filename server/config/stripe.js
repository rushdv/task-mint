const Stripe = require('stripe');

// Coin packages available for purchase
const COIN_PACKAGES = [
  { coins: 10, price: 1, label: 'Starter' },
  { coins: 150, price: 10, label: 'Basic' },
  { coins: 500, price: 20, label: 'Pro' },
  { coins: 1000, price: 35, label: 'Elite' },
];

// Coin conversion rate: 20 coins = $1 (worker withdrawal)
// Buyer purchase rate: 10 coins = $1
const WITHDRAWAL_RATE = 20; // coins per dollar
const MIN_WITHDRAWAL_COINS = 200;

const getStripe = () => Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = { getStripe, COIN_PACKAGES, WITHDRAWAL_RATE, MIN_WITHDRAWAL_COINS };
