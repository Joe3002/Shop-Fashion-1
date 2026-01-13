import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.json({ success: false, message: 'Thiếu thông tin!' });
    }
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: 'Không tìm thấy user!' });
    if (user.type === 'loginGoogle') {
      return res.json({ success: false, message: 'Tài khoản Google không thể đổi mật khẩu!' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Mật khẩu cũ không đúng!' });
    }
    if (newPassword.length < 8) {
      return res.json({ success: false, message: 'Mật khẩu mới phải từ 8 ký tự!' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default changePassword;
