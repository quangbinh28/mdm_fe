import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thanh toán!');
      window.location.href = '/login';
      return;
    }

    try {
      // Giả lập gọi API thanh toán (thay bằng API thực tế của bạn)
      await axios.post(
        'http://localhost:8080/api/checkout',
        { cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Thanh toán thành công!');
      // Xóa giỏ hàng sau thanh toán
      localStorage.removeItem('cart');
      window.location.href = '/';
    } catch (err) {
      alert('Thanh toán thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="cart-container">
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống. <Link to="/" className="link">Tiếp tục mua sắm</Link></p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ</h3>
            <button className="checkout-button" onClick={handleCheckout}>
              Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;