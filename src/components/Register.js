import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await axios.post('https://reqres.in/api/register', {
        email,
        password,
      });
      // Lưu token vào localStorage (giả lập phiên đăng ký)
      localStorage.setItem('token', response.data.token);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError('Đăng ký thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng ký</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email..."
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>
        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu..."
            required
          />
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