import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return this.type !== 'loginGoogle'; } },
    cartData: { type: Object, default: {} },
    type: { type: String, required: true, enum:['login', 'loginGoogle'] },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dob: { type: String, default: '' }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
