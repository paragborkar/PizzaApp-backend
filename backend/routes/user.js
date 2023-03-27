import express from "express";
import {signup , login , getAdminStats, sendPasswordLink, forgotPassword, forgotPassword2  } from '../controllers/user-controller.js';

const router = express.Router();


router.post('/signup',signup);
router.post('/login', login);
router.post('/sendpasswordlink',sendPasswordLink);
router.post('/:id/:token',forgotPassword2);
router.get("/admin/stats", getAdminStats);
router.get('/forgotpassword/:id/:token',forgotPassword);

export default router;