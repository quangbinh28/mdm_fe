import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { phone, password } = formData;
    if (!phone || !password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validate số điện thoại
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ! (Ví dụ: 0987654321 hoặc +84987654321)');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', formData);
      localStorage.setItem('token', response.data.token);
      alert('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại..."
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>
        <button type="submit" className="submit-button">Đăng nhập</button>
        <p>
          Chưa có tài khoản? <Link to="/register" className="link">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;