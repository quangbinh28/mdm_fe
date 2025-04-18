import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductRegister.css';

const ProductRegister = () => {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productCategories: [],
    brand: '',
    productVariants: [{ size: '', color: '', price: '' }],
    productPrice: '',
    productImg: '',
    productQuantity: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const productCategories = prev.productCategories.includes(categoryId)
        ? prev.productCategories.filter((id) => id !== categoryId)
        : [...prev.productCategories, categoryId];
      return { ...prev, productCategories };
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const productVariants = [...prev.productVariants];
      productVariants[index] = { ...productVariants[index], [field]: value };
      return { ...prev, productVariants };
    });
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      productVariants: [...prev.productVariants, { size: '', color: '', price: '' }],
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      productVariants: prev.productVariants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra các trường bắt buộc
    const { productName, productDescription, productCategories, brand, productVariants, productPrice, productImg, productQuantity } = formData;
    if (!productName || !productDescription || productCategories.length === 0 || !brand || productVariants.length === 0 || !productPrice || !productImg || !productQuantity) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra biến thể
    for (const variant of productVariants) {
      if (!variant.size || !variant.color || !variant.price) {
        setError('Vui lòng điền đầy đủ thông tin biến thể!');
        return;
      }
    }

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đăng ký sản phẩm!');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8080/api/products/insert',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đăng ký sản phẩm thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký sản phẩm thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="product-register-container">
      <h2>Đăng ký sản phẩm</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="product-register-form">
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm..."
            required
          />
        </div>
        <div className="form-group">
          <label>Mô tả sản phẩm</label>
          <textarea
            name="productDescription"
            value={formData.productDescription}
            onChange={handleChange}
            placeholder="Nhập mô tả sản phẩm..."
            required
          />
        </div>
        <div className="form-group">
          <label>Danh mục sản phẩm</label>
          <div className="categories">
            {categories.map((category) => (
              <label key={category.id} className="category">
                <input
                  type="checkbox"
                  checked={formData.productCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Thương hiệu</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Nhập thương hiệu..."
            required
          />
        </div>
        <div className="form-group">
          <label>Biến thể sản phẩm</label>
          {formData.productVariants.map((variant, index) => (
            <div key={index} className="variant">
              <input
                type="text"
                placeholder="Kích thước..."
                value={variant.size}
                onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Màu sắc..."
                value={variant.color}
                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Giá..."
                value={variant.price}
                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                required
              />
              {formData.productVariants.length > 1 && (
                <button type="button" className="remove-variant" onClick={() => removeVariant(index)}>
                  Xóa
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-variant" onClick={addVariant}>
            Thêm biến thể
          </button>
        </div>
        <div className="form-group">
          <label>Giá sản phẩm</label>
          <input
            type="number"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            placeholder="Nhập giá sản phẩm..."
            required
          />
        </div>
        <div className="form-group">
          <label>Ảnh sản phẩm (URL)</label>
          <input
            type="text"
            name="productImg"
            value={formData.productImg}
            onChange={handleChange}
            placeholder="Nhập URL ảnh sản phẩm..."
            required
          />
        </div>
        <div className="form-group">
          <label>Số lượng tồn kho</label>
          <input
            type="number"
            name="productQuantity"
            value={formData.productQuantity}
            onChange={handleChange}
            placeholder="Nhập số lượng..."
            required
          />
        </div>
        <button type="submit" className="submit-button">Đăng ký sản phẩm</button>
        <p>
          Đã có tài khoản? <Link to="/login" className="link">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default ProductRegister;