import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    console.log('authUser middleware chạy');
    const { token } = req.headers;
    if (!token) {
        console.log('Thiếu token');
        return res.status(401).json({ success: false, message: 'Không được phép đăng nhập lại' });
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        console.log('Token decode:', token_decode);
        next();
    } catch (error) {
        console.log('Lỗi xác thực:', error);
        return res.status(401).json({ success: false, message: error.message });
    }
};
export default authUser