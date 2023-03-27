import express from 'express';
import dotenv from 'dotenv';
import userRoute from './routes/user.js';
import orderRoute from './routes/order.js';
import cors from 'cors';


const app=express();
app.use(cors());
app.use(express.json());

dotenv.config();
app.use("/api/v1",userRoute);
app.use("/api/v1",orderRoute);
export default app;