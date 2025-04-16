import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Shopee</Link>
        <div className="nav">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." className="search-input" />
          <button className="search-button">Tìm</button>
          <Link to="/login" className="nav-link">Đăng nhập</Link>
          <Link to="/register" className="nav-link">Đăng ký</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;