import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import { Order } from "../models/Order.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
}) 


export const login = async (req,res,next) =>{
    const {email, password} = req.body;

    let existingUser;

    try{
        existingUser = await User.findOne({email});
    }catch(err){
       return console.log(err);
    }
    if(!existingUser)
    { 
        return res
        .status(404)
        .json({message:"Cannot Find User By This Email"});
    }
    const isPasswordCorrect = bcrypt.compareSync(password,existingUser.password);

    if(!isPasswordCorrect)
    {
        return res.status(400).json({message:"Incorrect Password"});
    }

    return res.status(200).json({message:"Login Successful", user:existingUser});
}

export const signup = async (req,res,next) =>{
    const {name, email , password} = req.body;

    let existingUser;

    try{
        existingUser = await User.findOne({email})
    }catch(err){
       return console.log(err);
    }
    if(existingUser)
    {
        res.status(400).json({message:"User Already Exist"})
    }
    const hashedPassword = bcrypt.hashSync(password);


    const user = new User({
        name,
        email,
        password: hashedPassword, 
    });

    
    try{
       await user.save();
    }catch(err){
    {  return  console.log(err);
    }
}
return res.status(201).json({user});

}

export const getAdminUsers = async (req,res) =>{
    const users=await User.find({});
    res.status(200).json({
        success:true,
        users
    });
}


export const getAdminStats = async (req, res) => {
    const usersCount = await User.countDocuments();
  
    const orders = await Order.find({});
  
    const preparingOrders = orders.filter((i) => i.orderStatus === "Preparing");
    const shippedOrders = orders.filter((i) => i.orderStatus === "Shipped");
    const deliveredOrders = orders.filter((i) => i.orderStatus === "Delivered");
  
    let totalIncome = 0;
  
    orders.forEach((i) => {
      totalIncome += i.totalAmount;
    });
  
    res.status(200).json({
      success: true,
      usersCount,
      ordersCount: {
        total: orders.length,
        preparing: preparingOrders.length,
        shipped: shippedOrders.length,
        delivered: deliveredOrders.length,
      },
      totalIncome,
    });
};

export const sendPasswordLink = async (req,res) =>{
    const {email} = req.body;

    if(!email){
        res.status(401).json({status:401,message:"Enter Your Email"})
    }

    try {
        const userfind = await User.findOne({email:email});

        const token = jwt.sign({_id:userfind._id},process.env.PASSWORD,{
            expiresIn:"600s"
        });

        
        const setusertoken = await User.findByIdAndUpdate({_id:userfind._id},{verifytoken:token});


        if(setusertoken){
            const mailOptions = {
                from:process.env.EMAIL,
                to:email,
                subject:"Sending Email For password Reset",
                text:`This Link Valid For 10 MINUTES https://pizzaapp-th4d.onrender.com/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("error",error);
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    res.status(201).json({status:201,message:"Email sent Succsfully"})
                }
            })

        }

    } catch (error) {
        res.status(401).json({status:401,message:"invalid user"})
    }
}

export const forgotPassword = async (req,res) =>{
    const id = req.params.id;
    const token=req.params.token;

    try {
        const validuser = await User.findOne({_id:id});
        if(validuser){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }

    } catch (error) {
        res.status(401).json({status:401,error})
    }
}

export const forgotPassword2 = async (req,res) =>{
    const {id,token} = req.params;
    const {password} = req.body;


    try {
        const validuser = await User.findOne({_id:id});
        
        if(validuser){
            const newpassword = await bcrypt.hash(password,12);

            const setnewuserpass = await User.findByIdAndUpdate({_id:id},{password:newpassword});

            setnewuserpass.save();
            res.status(201).json({status:201,setnewuserpass})

        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})
    }
}
