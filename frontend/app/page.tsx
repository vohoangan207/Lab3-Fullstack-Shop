'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await toast.promise(
        api.post('/api/products', { name, price }),
        {
          loading: 'Đang lưu...',
          success: 'Thêm sản phẩm thành công!',
          error: 'Có lỗi xảy ra!',
        }
      );
      setName('');
      setPrice('');
      fetchProducts();
    } catch (err: any) {
      console.error(err.response?.data?.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá?')) return;
    try {
      // Xoá sản phẩm khỏi giao diện ngay lập tức (optimistic update)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      
      // Gọi API xoá trên server
      await api.delete(`/api/products/${id}`);
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    } catch (err) {
      toast.error('Xoá thất bại, thử lại!');
      fetchProducts(); // Rollback (tải lại danh sách) nếu server báo lỗi
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Quản lý Sản Phẩm</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Tên sản phẩm" 
          className="border p-3 rounded text-black outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          placeholder="Giá (VNĐ)" 
          type="number" 
          className="border p-3 rounded text-black outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition duration-200 mt-2">
          Thêm sản phẩm
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {products.map((p) => (
          <div key={p.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white text-black">
            <div>
              <strong className="block text-lg">{p.name}</strong>
              <span className="text-sm text-gray-600">{p.price.toLocaleString()} VNĐ</span>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium transition duration-200"
            >
              Xoá
            </button>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-gray-500 italic">Chưa có sản phẩm nào.</p>}
      </div>
    </div>
  );
}