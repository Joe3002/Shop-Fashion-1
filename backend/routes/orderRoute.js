import express from 'express';
import { placeOrder, allOrders, userOrders, updateStatus } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin: lấy tất cả đơn hàng
orderRouter.post('/list', (req, res, next) => { console.log('Route /list hit'); next(); }, adminAuth, allOrders);
// Admin: cập nhật trạng thái đơn hàng
orderRouter.post('/status', (req, res, next) => { console.log('Route /status hit'); next(); }, adminAuth, updateStatus);

// User: đặt hàng (COD)
orderRouter.post('/place', (req, res, next) => { console.log('Route /place hit'); next(); }, authUser, placeOrder);
// User: lấy đơn hàng của mình
orderRouter.post('/userorders', (req, res, next) => { console.log('Route /userorders hit'); next(); }, authUser, userOrders);

export default orderRouter;