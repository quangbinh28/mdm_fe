import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ShopRegister.css';

const ShopRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    shopAddress: '',
    email: '',
    mobileNumber: '',
    shipMethodList: [],
    businessAddress: '',
    ownerId: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const shipMethods = [
    'Giao hàng nhanh',
    'Giao hàng tiết kiệm',
    'Giao hàng quốc tế',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShipMethodChange = (method) => {
    setFormData((prev) => {
      const shipMethodList = prev.shipMethodList.includes(method)
        ? prev.shipMethodList.filter((m) => m !== method)
        : [...prev.shipMethodList, method];
      return { ...prev, shipMethodList };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra các trường bắt buộc
    const { name, shopAddress, email, mobileNumber, businessAddress, ownerId } = formData;
    if (!name || !shopAddress || !email || !mobileNumber || !businessAddress || !ownerId) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đăng ký shop!');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/shops/register',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Đăng ký shop thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký shop thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="shop-register-container">
      <h2>Đăng ký shop</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="shop-register-form">
        <div className="form-group">
          <label>Tên shop</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên shop..."
            required
          />
        </div>
        <div className="form-group">
          <label>Địa chỉ shop</label>
          <input
            type="text"
            name="shopAddress"
            value={formData.shopAddress}
            onChange={handleChange}
            placeholder="Nhập địa chỉ shop..."
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email..."
            required
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Nhập số điện thoại..."
            required
          />
        </div>
        <div className="form-group">
          <label>Phương thức vận chuyển</label>
          <div className="ship-methods">
            {shipMethods.map((method) => (
              <label key={method} className="ship-method">
                <input
                  type="checkbox"
                  checked={formData.shipMethodList.includes(method)}
                  onChange={() => handleShipMethodChange(method)}
                />
                {method}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Địa chỉ kinh doanh</label>
          <input
            type="text"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder="Nhập địa chỉ kinh doanh..."
            required
          />
        </div>
        <button type="submit" className="submit-button">Đăng ký shop</button>
        <p>
          Đã có tài khoản? <Link to="/login" className="link">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default ShopRegister;