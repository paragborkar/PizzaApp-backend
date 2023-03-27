import app from './app.js';
import { connectDB } from './database.js';
import Razorpay from 'razorpay';

connectDB();


export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

app.listen(process.env.PORT,()=>{
    console.log(`Server Is Listening On Port ${process.env.PORT}`);
})