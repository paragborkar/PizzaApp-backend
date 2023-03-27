import express from "express";
import {signup , login , getAdminStats, sendOtp, checkOtp, changePassword  } from '../controllers/user-controller.js';

const router = express.Router();


router.post('/signup',signup);
router.post('/login', login);
router.post('/sendotp',sendOtp);
router.post('/checkotp',checkOtp);
router.post('/changepassword',changePassword);
router.get("/admin/stats", getAdminStats);

export default router;