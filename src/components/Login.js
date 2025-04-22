import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs'; // thêm gói này nếu chưa có
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
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

    const { phoneNumber, password } = formData;
    if (!phoneNumber || !password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validate số điện thoại
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Số điện thoại không hợp lệ! (Ví dụ: 0987654321 hoặc +84987654321)');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        qs.stringify({
          phoneNumber,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const user = response.data;
      // Lưu thông tin user (trừ password)
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      alert('Đăng nhập thành công!');

      window.location.href = '/';

      //localStorage.setItem('token', response.data.token);
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
            name="phoneNumber"
            value={formData.phoneNumber}
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