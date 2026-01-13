import React, { useState } from 'react';

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || '',
    description: product.description || '',
    category: product.category || '',
    subCategory: product.subCategory || '',
    sizes: product.sizes || [],
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave({ ...product, ...form });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
        <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Tên sản phẩm" />
        <input name="price" value={form.price} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Giá" type="number" />
        <input name="description" value={form.description} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Mô tả" />
        <input name="category" value={form.category} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Danh mục" />
        <input name="subCategory" value={form.subCategory} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Phân loại" />
        <input name="sizes" value={form.sizes} onChange={handleChange} className="border p-2 w-full mb-2" placeholder="Size (cách nhau bởi dấu phẩy)" />
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Lưu</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
