import React, { useState } from 'react';

const EditProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || '',
    description: product.description || '',
    category: product.category || 'Women',
    subCategory: product.subCategory || 'Topwear',
    bestseller: product.bestseller || false,
    sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : [{ size: '', stock: '' }],
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSizeChange = (index, event) => {
    const newSizes = [...form.sizes];
    newSizes[index][event.target.name] = event.target.value;
    setForm({ ...form, sizes: newSizes });
  };

  const addSizeRow = () => {
    setForm({ ...form, sizes: [...form.sizes, { size: "", stock: "" }] });
  };

  const removeSizeRow = (index) => {
    const newSizes = form.sizes.filter((_, i) => i !== index);
    setForm({ ...form, sizes: newSizes });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const dataToSave = {
        ...form,
        price: Number(form.price),
        sizes: form.sizes.map(s => ({...s, stock: Number(s.stock)}))
    };
    onSave({ ...product, ...dataToSave });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
        <div className='flex flex-col gap-3'>
            <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full" placeholder="Tên sản phẩm" />
            <input name="price" value={form.price} onChange={handleChange} className="border p-2 w-full" placeholder="Giá" type="number" />
            <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" placeholder="Mô tả" rows="3" />
            <div className='grid grid-cols-2 gap-4'>
                <select name="category" value={form.category} onChange={handleChange} className="border p-2 w-full"><option value="Women">Women</option><option value="Men">Men</option><option value="Kids">Kids</option></select>
                <select name="subCategory" value={form.subCategory} onChange={handleChange} className="border p-2 w-full"><option value="Topwear">Topwear</option><option value="Bottomwear">Bottomwear</option><option value="Winterwear">Winterwear</option></select>
            </div>
            <div className='flex items-center gap-2'>
                <input type="checkbox" name="bestseller" id="edit-bestseller" checked={form.bestseller} onChange={handleChange} />
                <label htmlFor="edit-bestseller">Đánh dấu là Bestseller</label>
            </div>
            <div className='border p-4 rounded-md bg-gray-50'>
                <p className='font-semibold mb-2'>Quản lý Size và Tồn kho</p>
                {form.sizes.map((sizeItem, index) => (
                    <div key={index} className='grid grid-cols-3 gap-4 items-center mb-2'>
                        <input name="size" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.size} type="text" placeholder='Size' className='border p-2 rounded' required />
                        <input name="stock" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.stock} type="number" placeholder='Tồn kho' className='border p-2 rounded' required min="0" />
                        {form.sizes.length > 1 && (
                            <button type="button" onClick={() => removeSizeRow(index)} className='bg-red-500 text-white w-8 h-8 rounded'>X</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSizeRow} className='mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm'>Thêm Size</button>
            </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Lưu</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;
