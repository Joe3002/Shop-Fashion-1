import { getAdminStats } from '../controllers/adminStatsController.js'
import adminAuth from '../middleware/adminAuth.js';
import express from 'express'
import { loginUser, registerUser, adminLogin, googleLogin, getUserInfo } from '../controllers/userController.js'
import changePassword from '../controllers/changePasswordController.js'
import forgotPassword from '../controllers/forgotPasswordController.js'
import auth from '../middleware/auth.js'


const userRoute = express.Router();
userRoute.get('/admin/stats', adminAuth, getAdminStats)
userRoute.post('/forgot-password', forgotPassword)

userRoute.post('/google-login', googleLogin)
userRoute.post('/register',registerUser)
userRoute.post('/login',loginUser)
userRoute.post('/admin',adminLogin)

userRoute.post('/change-password', auth, changePassword)
userRoute.get('/me', auth, getUserInfo)

export default userRoute;