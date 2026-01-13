import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const CategoryAdmin = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    const res = await axios.get(backendUrl + '/api/category/list');
    if (res.data.success) setCategories(res.data.categories);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error('Tên danh mục là bắt buộc');
    if (editId) {
      // Sửa
      const res = await axios.post(backendUrl + '/api/category/update', { id: editId, name, description }, { headers: { token } });
      if (res.data.success) toast.success('Đã sửa danh mục');
      else toast.error(res.data.message);
    } else {
      // Thêm
      const res = await axios.post(backendUrl + '/api/category/add', { name, description }, { headers: { token } });
      if (res.data.success) toast.success('Đã thêm danh mục');
      else toast.error(res.data.message);
    }
    setName(''); setDescription(''); setEditId(null);
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá danh mục?')) return;
    const res = await axios.post(backendUrl + '/api/category/delete', { id }, { headers: { token } });
    if (res.data.success) toast.success('Đã xoá danh mục');
    else toast.error(res.data.message);
    fetchCategories();
  };

  return (
    <div className='p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto'>
      <h2 className='text-2xl font-bold mb-6 flex items-center gap-2'>
        <span role="img" aria-label="category">📂</span> Quản lý danh mục sản phẩm
      </h2>
      <form onSubmit={handleAddOrEdit} className='mb-8 flex flex-col md:flex-row gap-3 items-center'>
        <input value={name} onChange={e => setName(e.target.value)} placeholder='Tên danh mục' className='border rounded-lg p-2 w-full md:w-1/3 focus:border-blue-400' />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder='Mô tả' className='border rounded-lg p-2 w-full md:w-1/3 focus:border-blue-400' />
        <button type='submit' className={`px-5 py-2 rounded-lg font-semibold transition-colors ${editId ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>{editId ? 'Lưu' : 'Thêm'}</button>
        {editId && <button type='button' className='ml-2 px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400' onClick={() => { setEditId(null); setName(''); setDescription(''); }}>Huỷ</button>}
      </form>
      <div className='overflow-x-auto'>
        <table className='w-full border text-sm rounded-lg overflow-hidden shadow'>
          <thead>
            <tr className='bg-blue-50 text-blue-700'>
              <th className='border p-3 font-semibold'>Tên</th>
              <th className='border p-3 font-semibold'>Mô tả</th>
              <th className='border p-3 font-semibold'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={3} className='text-center py-6 text-gray-400'>Chưa có danh mục nào</td></tr>
            )}
            {categories.map(cat => (
              <tr key={cat._id} className='hover:bg-blue-50 transition'>
                <td className='border p-3'>{cat.name}</td>
                <td className='border p-3'>{cat.description}</td>
                <td className='border p-3 flex gap-2 justify-center'>
                  <button className='px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition' onClick={() => handleEdit(cat)}>
                    <span role="img" aria-label="edit">✏️</span> Sửa
                  </button>
                  <button className='px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition' onClick={() => handleDelete(cat._id)}>
                    <span role="img" aria-label="delete">🗑️</span> Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryAdmin;
