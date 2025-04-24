import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null); // Quản lý đơn hàng đang mở
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.customerId;

  // Lấy danh sách đơn hàng từ backend
  const fetchOrders = async () => {
    if (!userId) {
      setError('Vui lòng đăng nhập để xem lịch sử mua hàng!');
      setLoading(false);
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/order/get-orders/${userId}`);
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải lịch sử mua hàng! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Định dạng ngày giờ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Mở/đóng chi tiết đơn hàng
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Lấy danh sách đơn hàng khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="order-history-container">Đang tải lịch sử mua hàng...</div>;
  }

  if (error) {
    return <div className="order-history-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="order-history-container">
      <h2>Lịch sử mua hàng</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-item">
              <div
                className="order-header"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="order-summary">
                  <h3>Mã đơn hàng: {order.id}</h3>
                  <p>Thời gian đặt hàng: {formatDate(order.orderTime)}</p>
                  <p>Tổng tiền: {order.totalPrice.toLocaleString('vi-VN')}đ</p>
                  <p>Trạng thái: {order.status}</p>
                </div>
                <button className="toggle-button">
                  {expandedOrder === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
              </div>
              {expandedOrder === order.id && (
                <div className="order-details">
                  <h4>Sản phẩm</h4>
                  <div className="product-list">
                    {order.products.map((product) => (
                      <div key={product.productId} className="product-item">
                        <div className="product-image">
                          <img
                            src={product.productImg || 'https://via.placeholder.com/100'}
                            alt={product.productName}
                          />
                        </div>
                        <div className="product-details">
                          <p><strong>{product.productName}</strong> - {product.variantName}</p>
                          <p>Số lượng: {product.quantity}</p>
                          <p>Giá: {(product.price * product.quantity).toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h4>Thông tin vận chuyển và thanh toán</h4>
                  <p><strong>Phương thức vận chuyển:</strong> {order.shipMethod.methodName} {order.shipMethod.cod ? '(COD)' : ''}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' : 'Chuyển khoản ngân hàng'}</p>
                  <h4>Địa chỉ giao hàng</h4>
                  <p>
                    {order.shipAddress.houseNumber}, {order.shipAddress.street}, {order.shipAddress.ward}, {order.shipAddress.district}, {order.shipAddress.city}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;