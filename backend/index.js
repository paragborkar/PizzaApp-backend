import app from './app.js';
import { connectDB } from './database.js';
import Razorpay from 'razorpay';
import https from 'https';
import http from 'http';

connectDB();

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server Is Listening On Port ${process.env.PORT}`);

  // Self-ping every 14 minutes to prevent Render from spinning down
  // Uses native setInterval — no node-cron needed (compatible with all Node versions)
  // const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT}`;
  // const PING_URL = `${BACKEND_URL}/api/v1/ping`;
  // const FOURTEEN_MINUTES = 14 * 60 * 1000;

  // setInterval(() => {
  //   const client = PING_URL.startsWith('https') ? https : http;
  //   client.get(PING_URL, (res) => {
  //     console.log(`[Keep-Alive] Pinged ${PING_URL} — Status: ${res.statusCode}`);
  //   }).on('error', (err) => {
  //     console.error(`[Keep-Alive] Ping failed: ${err.message}`);
  //   });
  // }, FOURTEEN_MINUTES);

  // console.log(`[Keep-Alive] Started — pinging ${PING_URL} every 14 minutes`);
});
