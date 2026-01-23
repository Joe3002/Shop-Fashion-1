import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
const Add = ({token}) => {

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subCategory, setSubcategory] = useState("")
  const [categoryList, setCategoryList] = useState([])
  // Lấy danh mục từ backend cho dropdown 'Loại'
  useEffect(() => {
    axios.get(backendUrl + '/api/category/list').then(res => {
      if (res.data.success) setCategoryList(res.data.categories);
    });
  }, []);
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([{ size: "S", stock: "" }])

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
  // --- Kết thúc ---

  const onSubmitHandler = async (e) =>{
    e.preventDefault();
    for (const s of sizes) {
        if (!s.size || s.stock === '' || isNaN(parseInt(s.stock)) || parseInt(s.stock) < 0) {
            toast.error("Vui lòng nhập đầy đủ và hợp lệ cho tất cả các size và số lượng tồn kho.");
            return;
        }
    }
    try {
     const formData = new FormData();
      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes.map(s => ({...s, stock: Number(s.stock)}))))

      image1 && formData.append("image1",image1)
      image2 && formData.append("image2",image2)
      image3 && formData.append("image3",image3)
      image4 && formData.append("image4",image4)

      const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})
      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setSizes([{ size: "S", stock: "" }])
      }else{
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 p-4'>
      <div className='mb-2'>
        <p>Thêm ảnh</p>
        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id='image1' hidden />
          </label>
          <label htmlFor="image2">
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id='image2' hidden />
          </label>
          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id='image3' hidden />
          </label>
          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id='image4' hidden />
          </label>
        </div>
      </div>
      <div className='w-full'>
        <p className='mb-2'>Tên sản phẩm</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Nhập tên' required />
      </div>
      <div className='w-full'>
        <p className='mb-2'>Mô tả</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Mô tả' required />
      </div>
      <div className='flex flex-col sm:flex-row gap-4 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Danh mục</p>
          <select onChange={(e)=>setCategory(e.target.value)} className='w-full px-3 py-2' >
            <option value="Men">Nam</option>
            <option value="Women">Nữ</option>
            <option value="Kids">Trẻ em</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Loại</p>
          <select onChange={(e)=>setSubcategory(e.target.value)} value={subCategory} className='w-full px-3 py-2' required>
            <option value="">Chọn loại</option>
            {categoryList.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className='mb-2'>Giá sản phẩm</p>
          <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='0' />
        </div>
      </div>
      <div className='border p-4 rounded-md bg-gray-50 w-full max-w-[500px]'>
        <p className='font-semibold mb-2'>Quản lý Size và Tồn kho</p>
        {sizes.map((sizeItem, index) => (
            <div key={index} className='grid grid-cols-3 gap-4 items-center mb-2'>
                <input name="size" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.size} type="text" placeholder='Size (S, M, L...)' className='border p-2 rounded' required />
                <input name="stock" onChange={(e) => handleSizeChange(index, e)} value={sizeItem.stock} type="number" placeholder='Số lượng tồn kho' className='border p-2 rounded' required min="0" />
                {sizes.length > 1 && (<button type="button" onClick={() => removeSizeRow(index)} className='bg-red-500 text-white w-8 h-8 rounded'>X</button>)}
            </div>
        ))}
        <button type="button" onClick={addSizeRow} className='mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm'>Thêm Size</button>
      </div>
      <div className='flex gap-2 mt-2'>
        <input onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
        <label className='cursor-pointer' htmlFor="bestseller">Thêm vào bestseller </label>
      </div>
      <button className='w-28 py-3 mt-4 bg-black text-white' type='submit'>Thêm</button>
    </form>
  )
}

export default Add
