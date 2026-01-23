import React, { useState, useEffect } from 'react';
// ...existing code...
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubcategory] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  // Lấy danh mục từ backend cho dropdown 'Loại'
  useEffect(() => {
    axios.get(backendUrl + '/api/category/list').then(res => {
      if (res.data.success) setCategoryList(res.data.categories);
    });
  }, []);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/detail/${id}`);
        if (response.data.success) {
          const p = response.data.product;
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(p.price || '');
          setCategory(p.category || 'Men');
          setSubcategory(p.subCategory || 'Topwear');
          setBestseller(p.bestseller || false);
          setSizes(Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [{ size: '', stock: '' }]);
          setImage1(p.image?.[0] || false);
          setImage2(p.image?.[1] || false);
          setImage3(p.image?.[2] || false);
          setImage4(p.image?.[3] || false);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error('Không lấy được thông tin sản phẩm!');
      }
    };
    fetchProduct();
  }, [id]);

  // --- Quản lý Size và Tồn kho ---
  const handleSizeChange = (index, event) => {
      const newSizes = [...sizes];
      newSizes[index][event.target.name] = event.target.value;
      setSizes(newSizes);
  };

  const addSizeRow = () => {
      setSizes([...sizes, { size: "", stock: "" }]);
  };

  const removeSizeRow = (index) => {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes.map(s => ({...s, stock: Number(s.stock)}))));
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      const response = await axios.post(`${backendUrl}/api/product/update`, formData, { headers: { token } });
      if (response.data.success) {
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Cập nhật sản phẩm thất bại!');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5">
      <h2 className="text-2xl font-bold mb-2 text-green-700 flex items-center gap-2">
        <span role="img" aria-label="edit">✏️</span> Chỉnh sửa sản phẩm
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium">Tên sản phẩm</label>
          <input value={name} onChange={e => setName(e.target.value)} className="border rounded-lg p-2 w-full focus:border-green-400" placeholder="Tên sản phẩm" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Giá</label>
          <input value={price} onChange={e => setPrice(e.target.value)} className="border rounded-lg p-2 w-full focus:border-green-400" placeholder="Giá" type="number" />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="border rounded-lg p-2 w-full focus:border-green-400" placeholder="Mô tả" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Danh mục</label>
          <div className="flex gap-4 mt-2">
            {['Nam', 'Nữ', 'Trẻ em'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={opt}
                  checked={category === opt}
                  onChange={e => setCategory(e.target.value)}
                  className="accent-green-500"
                />
                <span className="font-medium">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Loại</label>
          <select value={subCategory} onChange={e => setSubcategory(e.target.value)} className="border rounded-lg p-2 w-full focus:border-green-400">
            <option value="">Chọn loại</option>
            {categoryList.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <div className='border p-4 rounded-md bg-gray-50'>
            <p className='font-semibold mb-2'>Quản lý Size và Tồn kho</p>
            {sizes.map((sizeItem, index) => (
                <div key={index} className='grid grid-cols-3 gap-4 items-center mb-2'>
                    <input name="size" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.size} type="text" placeholder='Size' className='border p-2 rounded' required />
                    <input name="stock" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.stock} type="number" placeholder='Tồn kho' className='border p-2 rounded' required min="0" />
                    {sizes.length > 1 && (<button type="button" onClick={() => removeSizeRow(index)} className='bg-red-500 text-white w-8 h-8 rounded'>X</button>)}
                </div>
            ))}
            <button type="button" onClick={addSizeRow} className='mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm'>Thêm Size</button>
          </div>
        </div>
      </div>
      <div>
        <label className="block mb-2 font-medium">Ảnh sản phẩm</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[image1, image2, image3, image4].map((img, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {img && typeof img === 'string' ? (
                <div className="relative group">
                  <img src={img} alt={`Ảnh ${idx+1}`} className="w-32 h-32 object-cover mb-2 rounded-xl shadow border-2 border-green-200" />
                  <button type="button" onClick={() => {
                    if(idx===0) setImage1(false);
                    if(idx===1) setImage2(false);
                    if(idx===2) setImage3(false);
                    if(idx===3) setImage4(false);
                  }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs opacity-80 hover:opacity-100 transition">X</button>
                </div>
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-xl mb-2 border border-dashed border-gray-300">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if(idx===0) setImage1(file);
                if(idx===1) setImage2(file);
                if(idx===2) setImage3(file);
                if(idx===3) setImage4(file);
              }} className="mt-1 block w-full text-sm text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              <span className="text-xs text-gray-500 mt-1">Ảnh {idx+1}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-6 justify-end">
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow">Lưu</button>
      </div>
    </form>
  );
};

export default Edit;
