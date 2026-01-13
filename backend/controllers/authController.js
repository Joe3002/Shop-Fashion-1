// ...existing code...
// Tích hợp Google Auth: sử dụng google-auth-library để xác thực người dùng qua Google
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Khởi tạo client Google OAuth với CLIENT_ID lấy từ biến môi trường
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Xử lý đăng nhập Google: nhận token từ frontend, xác thực với Google, tạo user nếu chưa có, trả JWT token
export const googleAuth = async (req, res) => {
  try {
    console.log('DEBUG googleAuth called', { body: req.body })
    const { token } = req.body
    if (!token) return res.status(400).json({ success: false, message: 'Token missing' })

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid token payload' })
    }

    const email = payload.email
    const name = payload.name || email.split('@')[0]
    const avatar = payload.picture

    let user = await User.findOne({ email })
    if (!user) {
      // Nếu model yêu cầu password thì tạo random, nếu không thì không include field password
      const userData = { name, email, avatar }
      if (User.schema.path('password')) {
        userData.password = Math.random().toString(36).slice(-12)
      }
      // nếu model có trường isVerified, set true, nếu không thì bỏ
      if (User.schema.path('isVerified')) {
        userData.isVerified = true
      }
      user = await User.create(userData)
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return res.json({ success: true, token: jwtToken, user })
  } catch (err) {
    console.error('googleAuth error:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}
// ...existing code...