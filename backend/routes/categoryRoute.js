import express from 'express';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

// Lấy tất cả danh mục (ai cũng xem được)
categoryRouter.get('/list', getAllCategories);
// Thêm danh mục (admin)
categoryRouter.post('/add', adminAuth, addCategory);
// Sửa danh mục (admin)
categoryRouter.post('/update', adminAuth, updateCategory);
// Xóa danh mục (admin)
categoryRouter.post('/delete', adminAuth, deleteCategory);

export default categoryRouter;
