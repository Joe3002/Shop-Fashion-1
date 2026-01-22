import { getAdminStats } from '../controllers/adminStatsController.js'
import adminAuth from '../middleware/adminAuth.js';
import express from 'express'
import { loginUser, registerUser, adminLogin, googleLogin, getUserInfo, getAllUsers, addUser, updateUser, deleteUser, updateUserProfile } from '../controllers/userController.js'
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

// --- Quản lý User (Admin) ---
userRoute.get('/list', adminAuth, getAllUsers);
userRoute.post('/add', adminAuth, addUser);
userRoute.post('/update', adminAuth, updateUser);
userRoute.post('/delete', adminAuth, deleteUser);

userRoute.post('/change-password', auth, changePassword)
userRoute.post('/me', auth, getUserInfo)
userRoute.post('/update-profile', auth, updateUserProfile)

export default userRoute;