import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="logo">Shopee Clone</div>
      <nav>
        <Link to="/">Trang chủ</Link>
        <Link to="/cart">Giỏ hàng</Link>
        {user ? (
          <>
            <Link to="/shop-register">Đăng ký shop</Link>
            <Link to="/product-register">Đăng ký sản phẩm</Link>
            <Link to="/user-profile">Hồ sơ</Link>
            <Link to="/order-history">Lịch sử mua hàng</Link> {/* Thêm liên kết */}
            <span>Chào, {user.customerPhone || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;