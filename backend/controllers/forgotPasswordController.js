import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.json({ success: false, message: 'Thiếu thông tin!' });
    }
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: 'Không tìm thấy user!' });
    if (user.type === 'loginGoogle') {
      return res.json({ success: false, message: 'Tài khoản Google không thể đặt lại mật khẩu!' });
    }
    if (newPassword.length < 8) {
      return res.json({ success: false, message: 'Mật khẩu mới phải từ 8 ký tự!' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    if (!user.type) user.type = 'login';
    await user.save();
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default forgotPassword;
