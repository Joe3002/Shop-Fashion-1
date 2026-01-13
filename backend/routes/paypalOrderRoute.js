import express from 'express';
import { placeOrderPaypal } from '../controllers/paypalOrderController.js';
const paypalOrderRouter = express.Router();

// Route nhận đơn hàng từ PayPal
paypalOrderRouter.post('/', placeOrderPaypal);

export default paypalOrderRouter;
