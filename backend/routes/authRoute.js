import express from 'express'
import { googleAuth } from '../controllers/authController.js'
const router = express.Router()

// Route xử lý đăng nhập Google: nhận POST /api/auth/google, gọi controller googleAuth
router.post('/google', googleAuth)

export default router