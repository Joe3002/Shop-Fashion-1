// Đăng nhập Google
const googleLogin = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: 'Thiếu email Google!' });
        let user = await userModel.findOne({ email });
        if (!user) {
            // Tạo user mới, tên là phần trước @ của email, type loginGoogle
            const name = email.split('@')[0];
            user = new userModel({ name, email, type: 'loginGoogle' });
            await user.save();
        }
        const token = createToken(user._id);
        res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, type: user.type } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
//Route for user login
const loginUser = async (req,res) =>{
    try {
        const {email,password} = req.body;

    const user = await userModel.findOne({email});

    if (!user) {
        return res.json({success:false, message:"Tài khoản không tồn tại "})
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        const token = createToken(user._id)
        res.json({success:true,token, user: { _id: user._id, name: user.name, email: user.email, type: user.type }})
    }
    else{
        res.json({success:false, message:"Sai mật khẩu"})
    }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,  message:error.message})
    }
    
} 

//Route for user register
const registerUser = async (req,res)=>{
    try {
        const {name,email,password} = req.body;
        //checking user already exists or not
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"Tài khoản đã tồn tại"})
        }
        //validating email format $ strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Vui lòng nhập email"})
        }
        if (password.length < 8) {
            return res.json({success:false, message:"Vui lòng nhập đúng định dạnh mật khẩu"})
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            name,
            email,
            password:hashedPassword,
            type: 'login'
        })
        const user = await newUser.save() 
        const token = createToken(user._id)

        // Gửi email chào mừng
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Chào mừng bạn đến với cửa hàng của Quân',
            text: `Xin chào ${name},\n\nChào mừng bạn đến với cửa hàng của Quân. Cảm ơn bạn đã đăng ký tài khoản!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Lỗi gửi email:', error);
            } else {
                console.log('Email đã gửi: ' + info.response);
            }
        });

        res.json({success:true,token, user: { _id: user._id, name: user.name, email: user.email, type: user.type }})

    } catch (error) {
        console.log(error)
        res.json({success:false,  message:error.message})
    }
}

//Route for admin login
const adminLogin = async(req,res)=>{
    try {
        const {email,password} = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else{
            console.log("❌ Admin Login Failed!");
            console.log("   Input   :", email, password);
            console.log("   Expected:", process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
            res.json({success:false,message:"Không phải tài khoản admin"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,  message:error.message})
    }
}
// Lấy thông tin user từ token
const getUserInfo = async (req, res) => {
    try {
        console.log("Getting user info for ID:", req.body.userId);
        const user = await userModel.findById(req.body.userId);
        if (!user) return res.json({ success: false, message: 'Không tìm thấy user!' });
        res.json({ success: true, user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            type: user.type,
            phone: user.phone || '',
            address: user.address || '',
            dob: user.dob || ''
        } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Cập nhật thông tin cá nhân (User)
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob } = req.body;
        await userModel.findByIdAndUpdate(userId, { name, phone, address, dob });
        res.json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// --- ADMIN FEATURES ---

// Lấy danh sách tất cả user
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({});
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Thêm user mới từ admin
const addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "Email đã tồn tại" });
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Email không hợp lệ" });
        if (password.length < 8) return res.json({ success: false, message: "Mật khẩu phải >= 8 ký tự" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({ name, email, password: hashedPassword, type: 'login' });
        await newUser.save();
        res.json({ success: true, message: "Thêm người dùng thành công" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Cập nhật thông tin user
const updateUser = async (req, res) => {
    try {
        const { userId, name, email, password } = req.body;
        const updateData = { name, email };

        if (password && password.length > 0) {
            if (password.length < 8) return res.json({ success: false, message: "Mật khẩu phải >= 8 ký tự" });
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await userModel.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Xóa user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xóa người dùng" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export {loginUser, registerUser, adminLogin, getUserInfo, googleLogin, getAllUsers, addUser, updateUser, deleteUser, updateUserProfile}