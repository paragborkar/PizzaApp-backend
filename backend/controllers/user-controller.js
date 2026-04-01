import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import { Order } from "../models/Order.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return console.log(err);
    }
    if (!existingUser) {
        return res
            .status(404)
            .json({ message: "Cannot Find User By This Email" });
    }
    const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" });
    }

    return res.status(200).json({ message: "Login Successful", user: existingUser });
}

export const signup = async (req, res, next) => {
    const { name, email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        return console.log(err);
    }
    if (existingUser) {
        res.status(400).json({ message: "User Already Exist" })
    }
    const hashedPassword = bcrypt.hashSync(password);


    const user = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await user.save();
    } catch (err) {
        {
            return console.log(err);
        }
    }
    return res.status(201).json({ user });

}

export const getAdminUsers = async (req, res) => {
    const users = await User.find({});
    res.status(200).json({
        success: true,
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


export const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ status: 400, message: "Enter Your Email" });
    }

    try {
        const newotp = Math.floor(1000 + Math.random() * 9000); // ensures strict 4-digits

        // 1. Combine two separate findByIdAndUpdate calls into a single findOneAndUpdate call
        // This cuts down database roundtrips from 3 down to 1!
        const userfind = await User.findOneAndUpdate(
            { email: email },
            { otp: newotp, date: Date.now() },
            { new: true } // returns the updated document
        );
        if (!userfind) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // 2. Respond to the frontend IMMEDIATELY so the user doesn't wait 14 seconds
        // IMPORTANT: We only return the _id and email. Never return the full `userfind` object 
        // to the frontend, otherwise you leak the OTP directly in the API response!
        res.status(201).json({
            status: 201, 
            message: "Email sending in background", 
            userfind: { _id: userfind._id, email: userfind.email }
        });

        // 3. Send the email asynchronously in the background. Node will continue executing this 
        // without keeping the client's HTTP request hanging.
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Sending Email For Password Reset",
            text: `Your OTP For Password Reset Is ${newotp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Background Email Error:", error);
            } else {
                console.log("Email sent successfully in background:", info.response);
            }
        });

    } catch (error) {
        console.error("sendOtp error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}

export const checkOtp = async (req, res) => {
    const { otpget, id } = req.body;

    try {
        const validuser = await User.findOne({_id:id});
        
        if (!validuser) {
            return res.status(404).json({status: 404, message: "User not found"});
        }

        if(String(validuser.otp) === String(otpget)){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,message:"Incorrect OTP"})
        }

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
}

export const changePassword = async (req, res) => {
    const { id, password } = req.body;


    try {
        const validuser = await User.findOne({ _id: id });

        if (validuser) {
            const newpassword = await bcrypt.hash(password, 12);

            const setnewuserpass = await User.findByIdAndUpdate({ _id: id }, { password: newpassword });

            setnewuserpass.save();
            res.status(201).json({ status: 201, setnewuserpass })

        } else {
            res.status(401).json({ status: 401, message: "user not exist" })
        }
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
}
