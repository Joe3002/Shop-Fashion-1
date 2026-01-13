import categoryModel from '../models/categoryModel.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.json({ success: false, message: 'Tên danh mục là bắt buộc' });
    const exists = await categoryModel.findOne({ name });
    if (exists) return res.json({ success: false, message: 'Danh mục đã tồn tại' });
    const category = new categoryModel({ name, description });
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const category = await categoryModel.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!category) return res.json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryModel.findByIdAndDelete(id);
    if (!category) return res.json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
