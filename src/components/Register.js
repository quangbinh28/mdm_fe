import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState(''); // Lỗi tức thời cho confirmPassword
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Kiểm tra tức thời cho confirmPassword
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setConfirmError('Mật khẩu xác nhận không khớp!');
      } else {
        setConfirmError('');
      }
    }
    // Cập nhật confirmError khi password thay đổi
    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setConfirmError('Mật khẩu xác nhận không khớp!');
      } else {
        setConfirmError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { phone, password, confirmPassword } = formData;
    if (!phone || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validate số điện thoại
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ! (Ví dụ: 0987654321 hoặc +84987654321)');
      return;
    }

    // Validate mật khẩu
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    // Validate xác nhận mật khẩu (dự phòng)
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/register', { phone, password });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng ký</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
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
        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu..."
            required
          />
          {confirmError && <p className="error confirm-error">{confirmError}</p>}
        </div>
        <button type="submit" className="submit-button">Đăng ký</button>
        <p>
          Đã có tài khoản? <Link to="/login" className="link">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;