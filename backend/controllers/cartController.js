import userModel from '../models/userModel.js'
import productModel from '../models/productModel.js';


const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body

        // --- KIỂM TRA TỒN KHO ---
        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({ success: false, message: "Không tìm thấy sản phẩm." });
        }

        const sizeInfo = product.sizes.find(s => s.size === size);
        if (!sizeInfo) {
            return res.json({ success: false, message: "Size không hợp lệ cho sản phẩm này." });
        }

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;
        const currentQuantityInCart = cartData[itemId]?.[size] || 0;

        if (sizeInfo.stock <= currentQuantityInCart) {
            return res.json({ success: false, message: "Sản phẩm đã hết hàng hoặc số lượng trong giỏ đã đạt tối đa." });
        }
        // --- KẾT THÚC KIỂM TRA ---

        if (cartData[itemId]) {
            cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }
        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Thêm vào giỏ hàng thành công" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Cập nhật giỏ hàng thành công" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }