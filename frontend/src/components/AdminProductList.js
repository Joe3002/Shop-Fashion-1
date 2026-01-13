import React, { useState } from 'react';
import EditProductForm from '../../components/EditProductForm';
import axios from 'axios';

const AdminProductList = ({ products, backendUrl, token, reloadProducts }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const handleSave = async (updatedProduct) => {
    try {
      await axios.post(backendUrl + '/api/product/update', updatedProduct, { headers: { token } });
      setShowEditForm(false);
      if (reloadProducts) reloadProducts();
    } catch (err) {
      alert('Cập nhật sản phẩm thất bại!');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách sản phẩm</h2>
      {products.map(product => (
        <div key={product._id} className="border p-2 flex justify-between items-center mb-2">
          <span>{product.name}</span>
          <button
            className="bg-yellow-500 text-white px-4 py-1 rounded"
            onClick={() => handleEdit(product)}
          >
            Chỉnh sửa
          </button>
        </div>
      ))}
      {showEditForm && (
        <EditProductForm
          product={selectedProduct}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default AdminProductList;
