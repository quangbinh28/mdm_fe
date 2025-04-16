import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const response = await axios.post('https://reqres.in/api/login', {
        email,
        password,
      });
      // Lưu token vào localStorage (giả lập phiên đăng nhập)
      localStorage.setItem('token', response.data.token);
      alert('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại! Vui lòng kiểm tra email hoặc mật khẩu.');
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
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
        <button type="submit" className="submit-button">Đăng nhập</button>
        <p>
          Chưa có tài khoản? <Link to="/register" className="link">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;