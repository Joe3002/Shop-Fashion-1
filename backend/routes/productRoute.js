import express from 'express'
import {listProduct,addProduct,removeProduct,singleProduct,updateProduct} from '../controllers/productController.js'
import upload from "../middleware/multer.js"
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();
productRouter.post('/update',adminAuth,upload.fields([
	{name:'image1',maxCount:1},
	{name:'image2',maxCount:1},
	{name:'image3',maxCount:1},
	{name:'image4',maxCount:1}
]),updateProduct);
productRouter.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/detail/:id', async (req, res) => {
	try {
		const product = await (await import('../models/productModel.js')).default.findById(req.params.id);
		if (!product) return res.json({ success: false, message: 'Không tìm thấy sản phẩm!' });
		res.json({ success: true, product });
	} catch (error) {
		res.json({ success: false, message: error.message });
	}
});
productRouter.get('/list',listProduct);

export default productRouter