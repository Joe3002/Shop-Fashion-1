import {v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'

//function for add product
const addProduct = async (req, res) => {
    try {
        const {name, description, price, bestseller, category, subCategory,sizes} = req.body

        const image1 = req.files.image1 &&  req.files.image1[0]
        const image2 = req.files.image2 &&   req.files.image2[0]
        const image3 = req.files.image3 &&  req.files.image3[0]
        const image4 = req.files.image4 &&   req.files.image4[0]
        
        const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)
        let imagesUrl = await Promise.all(
            images.map(async (item) =>{
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                return result.secure_url
            })
        )
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true :false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }
       
       const product = new productModel(productData)
       await product.save()
       res.json({success: true,message:"Thêm thành công"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
   
}


//functinon for list product
const listProduct = async (req,res) =>{
    try {
        const products = await productModel.find({});
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//function for removing product
const removeProduct = async (req,res) =>{
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Xóa thành công"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}


//funcyion for single product info 
const singleProduct = async (req,res) =>{
    try {
        const {productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// Hàm cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, bestseller, sizes } = req.body;
        const product = await productModel.findById(id);
        if (!product) return res.json({ success: false, message: 'Không tìm thấy sản phẩm!' });

        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.subCategory = subCategory;
        product.bestseller = bestseller === "true" || bestseller === true;
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

        // Xử lý ảnh mới nếu có upload
        let images = [];
        for (let i = 1; i <= 4; i++) {
            const imgField = `image${i}`;
            if (req.files && req.files[imgField] && req.files[imgField][0]) {
                // Nếu có file mới, upload lên cloudinary
                const result = await cloudinary.uploader.upload(req.files[imgField][0].path, { resource_type: 'image' });
                images.push(result.secure_url);
            } else if (product.image[i - 1]) {
                images.push(product.image[i - 1]);
            }
        }
        product.image = images;

        await product.save();
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export {listProduct,addProduct,removeProduct,singleProduct,updateProduct}
