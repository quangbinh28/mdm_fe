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

  // Lấy danh sách địa chỉ và thẻ ngân hàng từ localStorage
  const savedAddresses = user?.customerAddress || [];
  const savedCards = user?.customerCards || [];

  // Thông tin thanh toán
  const [address, setAddress] = useState({
    houseNumber: '',
    street: '',
    city: '',
    ward: '',
    district: ''
  });
  const [shipMethod, setShipMethod] = useState({ methodName: 'STANDARD', cod: false });
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [selectedCardIndex, setSelectedCardIndex] = useState('');

  // Danh sách phương thức vận chuyển và hỗ trợ COD
  const shipMethodOptions = [
    { methodName: 'STANDARD', codSupported: true, displayName: 'Tiêu chuẩn' },
    { methodName: 'EXPRESS', codSupported: false, displayName: 'Nhanh' }
  ];

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
            image: item.productImg,
            variantName: item.variantName
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
      image: item.image
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

  // Xử lý chọn địa chỉ từ dropdown
  const handleAddressSelect = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === '') {
      setAddress({
        houseNumber: '',
        street: '',
        city: '',
        ward: '',
        district: ''
      });
    } else {
      const selectedAddress = savedAddresses[parseInt(selectedIndex)];
      setAddress({
        houseNumber: selectedAddress.houseNumber || '',
        street: selectedAddress.street || '',
        city: selectedAddress.city || '',
        ward: selectedAddress.ward || '',
        district: selectedAddress.district || ''
      });
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

    // Kiểm tra thông tin địa chỉ
    if (!address.houseNumber || !address.street || !address.city || !address.ward || !address.district) {
      alert('Vui lòng nhập đầy đủ thông tin địa chỉ!');
      return;
    }

    // Kiểm tra tính hợp lệ của paymentMethod và cod
    if (shipMethod.cod && paymentMethod !== 'CASH_ON_DELIVERY') {
      alert('Khi chọn COD, phương thức thanh toán phải là "Thanh toán khi nhận hàng"!');
      return;
    }
    if (!shipMethod.cod && paymentMethod === 'CASH_ON_DELIVERY') {
      alert('Phương thức vận chuyển không hỗ trợ COD, vui lòng chọn phương thức thanh toán khác!');
      return;
    }

    // Kiểm tra thẻ ngân hàng khi chọn CREDIT_CARD
    if (paymentMethod === 'CREDIT_CARD') {
      if (savedCards.length === 0) {
        alert('Bạn chưa có thẻ ngân hàng! Vui lòng thêm thẻ trong hồ sơ.');
        return;
      }
      if (selectedCardIndex === '') {
        alert('Vui lòng chọn thẻ ngân hàng để thanh toán!');
        return;
      }
    }

    // Chuẩn bị dữ liệu OrderRequest
    const orderRequest = {
      userId: userId,
      address: {
        houseNumber: address.houseNumber,
        street: address.street,
        city: address.city,
        ward: address.ward,
        district: address.district
      },
      products: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImg: item.image,
        variantName: item.variantName,
        productSKU: item.productSKU,
        quantity: item.quantity,
        price: item.price
      })),
      shipMethod: {
        methodName: shipMethod.methodName,
        cod: shipMethod.cod
      },
      paymentMethod: paymentMethod,
      paymentDetails: paymentMethod === 'CREDIT_CARD' && selectedCardIndex !== ''
        ? savedCards[parseInt(selectedCardIndex)]
        : null,
      totalPrice: totalPrice
    };

    try {
      // Gọi API tạo đơn hàng
      await axios.post('http://localhost:8080/api/order/create', orderRequest);
      // Xóa giỏ hàng trên backend
      await axios.delete(`http://localhost:8080/api/cart/delete/${userId}`);
      setCart([]);
      alert('Thanh toán thành công! Đơn hàng đã được tạo.');
      navigate('/');
    } catch (err) {
      alert('Thanh toán thất bại! Vui lòng thử lại.');
    }
  };

  // Lấy giỏ hàng và tự động chọn địa chỉ/thẻ mặc định khi component mount
  useEffect(() => {
    fetchCart();
    // Tự động chọn địa chỉ mặc định nếu có
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setAddress({
        houseNumber: defaultAddress.houseNumber || '',
        street: defaultAddress.street || '',
        city: defaultAddress.city || '',
        ward: defaultAddress.ward || '',
        district: defaultAddress.district || ''
      });
    }
    // Tự động chọn thẻ mặc định nếu có
    const defaultCardIndex = savedCards.findIndex(card => card.isDefault);
    if (defaultCardIndex !== -1) {
      setSelectedCardIndex(defaultCardIndex.toString());
    }
  }, []);

  if (loading) {
    return <div className="cart-container">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return <div className="cart-container"><p className="error">{error}</p></div>;
  }

  // Kiểm tra xem phương thức vận chuyển có hỗ trợ COD hay không
  const selectedShipMethod = shipMethodOptions.find(option => option.methodName === shipMethod.methodName);
  const isCodSupported = selectedShipMethod?.codSupported || false;

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
                <div className="cart-item-image">
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.productName} />
                </div>
                <div className="cart-item-details">
                  <h4>{`${item.productName} - ${item.variantName}`}</h4>
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
          <div className="checkout-form">
            <h3>Thông tin thanh toán</h3>
            <div className="form-group">
              <label>Địa chỉ giao hàng: </label>
              {savedAddresses.length > 0 ? (
                <>
                  <select onChange={handleAddressSelect} className="address-select">
                    <option value="">Chọn địa chỉ...</option>
                    {savedAddresses.map((addr, index) => (
                      <option key={index} value={index}>
                        {`${addr.houseNumber ? `Số ${addr.houseNumber}` : ''}, ${
                          addr.street ? `Đường ${addr.street}` : ''
                        }, ${
                          addr.ward ? `Phường ${addr.ward}` : ''
                        }, ${
                          addr.district ? `Quận ${addr.district}` : ''
                        }, ${
                          addr.city ? `Thành phố/Tỉnh ${addr.city}` : ''
                        }`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '')}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <p className="no-address-message">
                  Bạn chưa có địa chỉ nào. Vui lòng nhập địa chỉ hoặc <Link to="/user-profile" className="link">thêm địa chỉ</Link>.
                </p>
              )}
              <input
                type="text"
                placeholder="Số nhà"
                value={address.houseNumber}
                onChange={(e) => setAddress({ ...address, houseNumber: e.target.value })}
              />
              <input
                type="text"
                placeholder="Đường"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                type="text"
                placeholder="Thành phố"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phường"
                value={address.ward}
                onChange={(e) => setAddress({ ...address, ward: e.target.value })}
              />
              <input
                type="text"
                placeholder="Quận"
                value={address.district}
                onChange={(e) => setAddress({ ...address, district: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phương thức vận chuyển: </label>
              <select
                value={shipMethod.methodName}
                onChange={(e) => {
                  const selectedOption = shipMethodOptions.find(option => option.methodName === e.target.value);
                  const newCod = selectedOption.codSupported ? shipMethod.cod : false;
                  setShipMethod({ methodName: e.target.value, cod: newCod });
                  if (newCod) {
                    setPaymentMethod('CASH_ON_DELIVERY');
                    setSelectedCardIndex('');
                  } else {
                    setPaymentMethod('CREDIT_CARD');
                  }
                }}
              >
                {shipMethodOptions.map(option => (
                  <option key={option.methodName} value={option.methodName}>
                    {option.displayName}
                  </option>
                ))}
              </select>
              <div className="cod-option">
                <input
                  type="checkbox"
                  checked={shipMethod.cod}
                  disabled={!isCodSupported}
                  onChange={(e) => {
                    const newCod = e.target.checked;
                    setShipMethod({ ...shipMethod, cod: newCod });
                    if (newCod) {
                      setPaymentMethod('CASH_ON_DELIVERY');
                      setSelectedCardIndex('');
                    } else {
                      setPaymentMethod('CREDIT_CARD');
                    }
                  }}
                />
                <label className={!isCodSupported ? 'disabled' : ''}>
                  Thanh toán khi nhận hàng (COD) {isCodSupported ? '' : '(Không hỗ trợ)'}
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Phương thức thanh toán: </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  if (e.target.value !== 'CREDIT_CARD') {
                    setSelectedCardIndex('');
                  }
                }}
                disabled={shipMethod.cod}
              >
                <option value="CASH_ON_DELIVERY" disabled={!shipMethod.cod}>
                  Thanh toán khi nhận hàng
                </option>
                <option value="CREDIT_CARD">Thẻ tín dụng</option>
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              </select>
              {paymentMethod === 'CREDIT_CARD' && (
                savedCards.length > 0 ? (
                  <>
                    <select
                      value={selectedCardIndex}
                      onChange={(e) => setSelectedCardIndex(e.target.value)}
                      className="card-select"
                    >
                      <option value="">Chọn thẻ ngân hàng...</option>
                      {savedCards.map((card, index) => (
                        <option key={index} value={index}>
                          {`Số thẻ: ${card.cardNumber} | Ngân hàng: ${card.bank} | Hết hạn: ${card.expiredIn}`}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <p className="no-card-message">
                    Bạn chưa có thẻ ngân hàng. Vui lòng <Link to="/user-profile" className="link">thêm thẻ</Link> hoặc chọn phương thức thanh toán khác.
                  </p>
                )
              )}
            </div>
          </div>
          <div className="cart-summary">
            <h3>Thông tin đơn hàng</h3>
            <p>
              <strong>Địa chỉ giao hàng: </strong>
              {address.houseNumber || address.street || address.city
                ? `${address.houseNumber ? `Số ${address.houseNumber}` : ''}, ${
                    address.street ? `Đường ${address.street}` : ''
                  }, ${
                    address.ward ? `Phường ${address.ward}` : ''
                  }, ${
                    address.district ? `Quận ${address.district}` : ''
                  }, ${
                    address.city ? `Thành phố/Tỉnh ${address.city}` : ''
                  }`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '')
                : 'Chưa chọn địa chỉ'}
            </p>
            <p>
              <strong>Phương thức vận chuyển: </strong>
              {shipMethodOptions.find(option => option.methodName === shipMethod.methodName)?.displayName}
              {shipMethod.cod ? ' (COD)' : ''}
            </p>
            <p>
              <strong>Phương thức thanh toán: </strong>
              {paymentMethod === 'CASH_ON_DELIVERY' ? 'Thanh toán khi nhận hàng' :
               paymentMethod === 'CREDIT_CARD' ? 
               (selectedCardIndex !== '' ? 
                `Thẻ tín dụng (${savedCards[parseInt(selectedCardIndex)]?.cardNumber})` : 
                'Thẻ tín dụng (Chưa chọn thẻ)') : 
               'Chuyển khoản ngân hàng'}
            </p>
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