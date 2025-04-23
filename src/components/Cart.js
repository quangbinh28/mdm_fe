import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.customerId;

  // Lấy giỏ hàng từ backend
  const fetchCart = async () => {
    if (!userId) {
      setError('Vui lòng đăng nhập để xem giỏ hàng!');
      setLoading(false);
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/cart/get-cart/${userId}`);
      // Chuyển Map thành mảng, lưu shopName cho mỗi item
      const cartItems = [];
      Object.entries(response.data).forEach(([shopName, items]) => {
        items.forEach(item => {
          cartItems.push({
            shopName,
            productId: item.productId,
            productName: item.productName,
            productSKU: item.productSKU,
            quantity: item.quantity,
            price: item.price,
          });
        });
      });
      setCart(cartItems);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải giỏ hàng! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Tính tổng tiền
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Cập nhật số lượng
  const updateQuantity = async (productId, shopName, newQuantity) => {
    if (newQuantity < 1) return;

    const item = cart.find(item => item.productId === productId && item.shopName === shopName);
    if (!item) return;

    const updatedItem = {
      productId: item.productId,
      productName: item.productName,
      productSKU: item.productSKU,
      quantity: newQuantity,
      price: item.price,
    };

    try {
      await axios.post(
        `http://localhost:8080/api/cart/add-item/${userId}/${shopName}`,
        updatedItem
      );
      setCart(cart.map(item =>
        item.productId === productId && item.shopName === shopName
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (err) {
      setError('Không thể cập nhật số lượng! Vui lòng thử lại.');
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId, shopName) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/cart/delete-item/${userId}/${shopName}/${productId}`
      );
      setCart(cart.filter(item => !(item.productId === productId && item.shopName === shopName)));
    } catch (err) {
      setError('Không thể xóa sản phẩm! Vui lòng thử lại.');
    }
  };

  // Thanh toán
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    if (!userId) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }

    try {
      // Gọi API thanh toán (cần kiểm tra backend)
      await axios.post('http://localhost:8080/api/checkout', { cart });
      // Xóa giỏ hàng trên backend
      await axios.delete(`http://localhost:8080/api/cart/delete/${userId}`);
      setCart([]);
      alert('Thanh toán thành công!');
      navigate('/');
    } catch (err) {
      alert('Thanh toán thất bại! Vui lòng thử lại.');
    }
  };

  // Lấy giỏ hàng khi component mount
  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return <div className="cart-container">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return <div className="cart-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="cart-container">
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống. <Link to="/" className="link">Tiếp tục mua sắm</Link></p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={`${item.shopName}-${item.productId}`} className="cart-item">
                <div className="cart-item-details">
                  <h4>{item.productName}</h4>
                  <p className="shop-name"><strong>Cửa hàng:</strong> {item.shopName}</p>
                  <p className="price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                  <div className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.productId, item.shopName, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.shopName, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.productId, item.shopName)}
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