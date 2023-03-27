import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import {Payment} from "../models/Payment.js"
import { instance } from "../index.js";
import crypto from "crypto";

export const placeOrder = async (req,res) =>{

    const {shippingInfo,orderItems,paymentMethod,itemsPrice,taxPrice,shippingCharges,totalAmount,user} =req.body;

    const orderOptions={
        shippingInfo,orderItems,paymentMethod,itemsPrice,taxPrice,shippingCharges,totalAmount,user
    };

   let order;
   try{
    order= await Order.create(orderOptions);
    }catch(err){
    return console.log(err);
    }
    if(!order)
    {
        res.status(400).json({
            success:false,
            message:"Unable To Place Order"
        })   
    }

    res.status(201).json({
        success:true,
        message:"Order Placed Successfully via Cash on Delivery"
    })
   
}


export const placeOrderOnline = async (req,res) =>{

    const {shippingInfo,orderItems,paymentMethod,itemsPrice,taxPrice,shippingCharges,totalAmount,user} =req.body;
    const orderOptions={
        shippingInfo,orderItems,paymentMethod,itemsPrice,taxPrice,shippingCharges,totalAmount,user
    };

  
    const options = {
        amount: Number(totalAmount) * 100,
        currency: "INR",
      };
      const order = await instance.orders.create(options);

    res.status(201).json({
        success:true,
        order,orderOptions
    });
   
}



export const getMyOrders = async (req,res) =>{
    const user=req.params.id;
    const orders = await Order.find({
        user
    });

    res.status(201).json({
        success:true,
        orders
    })
}

export const getOrderDetails = async (req,res) =>{
    const order = await Order.findById(req.params.id);

    if(!order)
    {
        res.status(400).json({message:"Invalid Order Id"});
    }

    res.status(201).json({
        success:true,
        order
    })
}

export const getAdminOrders = async (req,res) =>{
    const user=req.params.id;
    const orders = await Order.find({});

    res.status(201).json({
        success:true,
        orders
    })
}

export const processOrder = async (req,res) =>{
    const order = await Order.findById(req.params.id);

    if(!order)
    {
        res.status(400).json({message:"Invalid Order Id"});
    }

    if(order.orderStatus==="Preparing") order.orderStatus="Shipped";
    else if(order.orderStatus==="Shipped") 
    {
        order.orderStatus="Delivered";
        order.deliveredAt= new Date(Date.now());
    }
    else if(order.orderStatus==="Delivered")
    {
        res.status(200).json({message:"Food Delivered"});
        return;
    } 
    await order.save();
    res.status(201).json({
        success:true,
        message:"Status Upadated Successfully"
    })
}

export const paymentVerification = async (req,res) =>{
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        orderOptions,
      } = req.body;
    
      const body = razorpay_order_id + "|" + razorpay_payment_id;
    
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body)
        .digest("hex");
    
      const isAuthentic = expectedSignature === razorpay_signature;
    
      if (isAuthentic) {
        const payment = await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
    
        await Order.create({
          ...orderOptions,
          paidAt: new Date(Date.now()),
          paymentInfo: payment._id,
        });
    
        res.status(201).json({
          success: true,
          message: `Order Placed Successfully. Payment ID: ${payment._id}`,
        });
      } else {
        return  res.status(400).json({message:"Payment Failed"});
      }
}

