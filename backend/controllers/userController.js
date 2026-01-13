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
        res.json({success:true,token})
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

        res.json({success:true,token})

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
        const user = await userModel.findById(req.body.userId);
        if (!user) return res.json({ success: false, message: 'Không tìm thấy user!' });
        res.json({ success: true, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export {loginUser,registerUser, adminLogin, getUserInfo, googleLogin}