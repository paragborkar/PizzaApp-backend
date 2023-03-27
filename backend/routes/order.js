import express from 'express';
import { getAdminOrders, getMyOrders, getOrderDetails, paymentVerification, placeOrder, placeOrderOnline, processOrder } from '../controllers/order.js';
import { getAdminUsers } from '../controllers/user-controller.js';

const router = express.Router();

router.post('/createorder',placeOrder);
router.post('/createorderonline',placeOrderOnline);
router.post('/paymentverification',paymentVerification);
router.get('/myorders/:id',getMyOrders);
router.get('/order/:id',getOrderDetails);
router.get('/admin/orders',getAdminOrders);
router.get('/admin/order/:id',processOrder);
router.get('/admin/users',getAdminUsers);



export default router;