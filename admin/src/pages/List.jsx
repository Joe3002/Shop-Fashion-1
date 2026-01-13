import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Không còn import EditProductForm. Nếu vẫn lỗi, hãy kiểm tra lại cache hoặc khởi động lại Vite.
import axios from 'axios'
import {backendUrl, formatVND} from '../App'
import { toast } from 'react-toastify'


const List = ({token}) => {

  const [list, setList] = useState([])
  const navigate = useNavigate();

  const fetchList = async () =>{
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      
      if (response.data.success) {
        setList(response.data.products);
      }else{
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      
    }
  }
  const removeProduct = async (id) =>{
    try {
      const response = await axios.post(backendUrl+'/api/product/remove',{id}, {headers:{token}})
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      }else{
        toast.error(response.data.message)
      }
    } catch (error) {
       console.log(error)
      toast.error(error.message)
    }
  }
  useEffect(()=>{
    fetchList()
  },[])

  const handleEdit = (product) => {
    navigate(`/edit/${product._id}`);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-green-700">Danh sách sản phẩm</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length === 0 && <p className="text-gray-400">Không có sản phẩm nào.</p>}
        {list.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border hover:shadow-2xl transition p-4 flex flex-col gap-3 relative group"
          >
            <div className="flex justify-center items-center mb-2">
              <img
                src={item.image[0]}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">{item.category}</span>
              </div>
              <span className="text-xs text-gray-500">{item.subCategory}</span>
              <span className="text-sm text-gray-600 truncate">{item.description}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold text-green-600">{formatVND(item.price)}</span>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                  onClick={() => handleEdit(item)}
                >
                  Chỉnh sửa
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow"
                  onClick={() => removeProduct(item._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
            {/* Hiệu ứng overlay khi hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 bg-green-500 pointer-events-none transition" />
          </div>
        ))}
      </div>
    </>
  )
}

export default List
