import express from 'express';
import dotenv from 'dotenv';
import userRoute from './routes/user.js';
import orderRoute from './routes/order.js';
import cors from 'cors';

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",userRoute);
app.use("/api/v1",orderRoute);

// Keep-alive dummy endpoint to prevent Render from spinning down
app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({ success: true, message: "pong 🍕" });
});

export default app;