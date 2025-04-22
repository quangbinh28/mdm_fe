import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ShopRegister.css';

const ShopRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    shopAddress: {
      houseNumber: '',
      street: '',
      city: '',
      ward: '',
      district: '',
    },
    email: '',
    mobileNumber: '',
    shipMethodList: [],
    businessAddress: {
      houseNumber: '',
      street: '',
      city: '',
      ward: '',
      district: '',
    },
    businessType: '',
    receiptEmails: [''],
    taxNo: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Danh sách phương thức giao hàng với giá trị cod
  const shipMethods = [
    { methodName: 'Giao hàng nhanh', cod: false },
    { methodName: 'Giao hàng tiết kiệm', cod: false },
    { methodName: 'Giao hàng COD', cod: true },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('shopAddress.') || name.includes('businessAddress.')) {
      const [field, subField] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subField]: value },
      }));
    } else if (name.includes('receiptEmails')) {
      const index = parseInt(name.split('.')[1], 10);
      const newEmails = [...formData.receiptEmails];
      newEmails[index] = value;
      setFormData((prev) => ({ ...prev, receiptEmails: newEmails }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShipMethodChange = (e) => {
    const { value, checked } = e.target;
    const selectedMethod = shipMethods.find((method) => method.methodName === value);
    setFormData((prev) => {
      const newShipMethods = checked
        ? [...prev.shipMethodList, selectedMethod]
        : prev.shipMethodList.filter((method) => method.methodName !== value);
      return { ...prev, shipMethodList: newShipMethods };
    });
  };

  const addReceiptEmail = () => {
    setFormData((prev) => ({
      ...prev,
      receiptEmails: [...prev.receiptEmails, ''],
    }));
  };

  const removeReceiptEmail = (index) => {
    setFormData((prev) => ({
      ...prev,
      receiptEmails: prev.receiptEmails.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Vui lòng đăng nhập để đăng ký shop!');
      navigate('/login');
      return;
    }

    const { name, shopAddress, email, mobileNumber, shipMethodList, businessAddress, businessType, receiptEmails, taxNo } = formData;

    // Validate basic fields
    if (!name) {
      setError('Vui lòng nhập tên shop!');
      return;
    }
    if (!email) {
      setError('Vui lòng nhập email!');
      return;
    }
    if (!mobileNumber) {
      setError('Vui lòng nhập số điện thoại!');
      return;
    }

    // Validate AddressEntity fields for shopAddress
    if (!shopAddress.houseNumber) {
      setError('Vui lòng nhập số nhà của địa chỉ shop!');
      return;
    }
    if (!shopAddress.street) {
      setError('Vui lòng nhập tên đường của địa chỉ shop!');
      return;
    }
    if (!shopAddress.city) {
      setError('Vui lòng nhập thành phố của địa chỉ shop!');
      return;
    }
    if (!shopAddress.ward) {
      setError('Vui lòng nhập phường của địa chỉ shop!');
      return;
    }
    if (!shopAddress.district) {
      setError('Vui lòng nhập quận của địa chỉ shop!');
      return;
    }

    // Validate AddressEntity fields for businessAddress
    if (!businessAddress.houseNumber) {
      setError('Vui lòng nhập số nhà của địa chỉ kinh doanh!');
      return;
    }
    if (!businessAddress.street) {
      setError('Vui lòng nhập tên đường của địa chỉ kinh doanh!');
      return;
    }
    if (!businessAddress.city) {
      setError('Vui lòng nhập thành phố của địa chỉ kinh doanh!');
      return;
    }
    if (!businessAddress.ward) {
      setError('Vui lòng nhập phường của địa chỉ kinh doanh!');
      return;
    }
    if (!businessAddress.district) {
      setError('Vui lòng nhập quận của địa chỉ kinh doanh!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ!');
      return;
    }

    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setError('Số điện thoại không hợp lệ! (Ví dụ: 0987654321 hoặc +84987654321)');
      return;
    }

    if (shipMethodList.length === 0) {
      setError('Vui lòng chọn ít nhất một phương thức giao hàng!');
      return;
    }

    // Validate receiptEmails (nếu có)
    for (let i = 0; i < receiptEmails.length; i++) {
      const email = receiptEmails[i].trim();
      if (email && !emailRegex.test(email)) {
        setError(`Email nhận hóa đơn thứ ${i + 1} không hợp lệ!`);
        return;
      }
    }

    // Validate taxNo (nếu có)
    if (taxNo && !/^\d{10}$/.test(taxNo)) {
      setError('Mã số thuế phải là 10 chữ số!');
      return;
    }

    const shopData = {
      name,
      shopAddress,
      email,
      mobileNumber,
      shipMethodList,
      businessAddress,
      businessType: businessType || null,
      receiptEmails: receiptEmails.filter((email) => email.trim() !== ''),
      taxNo: taxNo || null,
      ownerId: user.customerId,
    };

    try {
      await axios.post('http://localhost:8080/api/auth/register/shop', shopData);
      alert('Đăng ký shop thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký shop thất bại!');
    }
  };

  return (
    <div className="shop-register-container">
      <h2>Đăng ký shop</h2>
      {error && <p className="error">{error}</p>}
      {!user ? (
        <p>Vui lòng <Link to="/login">đăng nhập</Link> để đăng ký shop.</p>
      ) : (
        <form onSubmit={handleSubmit} className="shop-register-form">
          <div className="form-group">
            <label>Tên shop *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên shop..."
              required
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ shop *</label>
            <input
              type="text"
              name="shopAddress.houseNumber"
              value={formData.shopAddress.houseNumber}
              onChange={handleInputChange}
              placeholder="Số nhà..."
              required
            />
            <input
              type="text"
              name="shopAddress.street"
              value={formData.shopAddress.street}
              onChange={handleInputChange}
              placeholder="Đường..."
              required
            />
            <input
              type="text"
              name="shopAddress.city"
              value={formData.shopAddress.city}
              onChange={handleInputChange}
              placeholder="Thành phố..."
              required
            />
            <input
              type="text"
              name="shopAddress.ward"
              value={formData.shopAddress.ward}
              onChange={handleInputChange}
              placeholder="Phường..."
              required
            />
            <input
              type="text"
              name="shopAddress.district"
              value={formData.shopAddress.district}
              onChange={handleInputChange}
              placeholder="Quận..."
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email..."
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại..."
              required
            />
          </div>

          <div className="form-group">
            <label>Phương thức giao hàng *</label>
            {shipMethods.map((method) => (
              <div key={method.methodName} className="checkbox-group">
                <input
                  type="checkbox"
                  value={method.methodName}
                  checked={formData.shipMethodList.some((m) => m.methodName === method.methodName)}
                  onChange={handleShipMethodChange}
                />
                <label>{method.methodName}</label>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Địa chỉ kinh doanh *</label>
            <input
              type="text"
              name="businessAddress.houseNumber"
              value={formData.businessAddress.houseNumber}
              onChange={handleInputChange}
              placeholder="Số nhà..."
              required
            />
            <input
              type="text"
              name="businessAddress.street"
              value={formData.businessAddress.street}
              onChange={handleInputChange}
              placeholder="Đường..."
              required
            />
            <input
              type="text"
              name="businessAddress.city"
              value={formData.businessAddress.city}
              onChange={handleInputChange}
              placeholder="Thành phố..."
              required
            />
            <input
              type="text"
              name="businessAddress.ward"
              value={formData.businessAddress.ward}
              onChange={handleInputChange}
              placeholder="Phường..."
              required
            />
            <input
              type="text"
              name="businessAddress.district"
              value={formData.businessAddress.district}
              onChange={handleInputChange}
              placeholder="Quận..."
              required
            />
          </div>

          <div className="form-group">
            <label>Loại hình kinh doanh</label>
            <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              placeholder="Nhập loại hình kinh doanh..."
            />
          </div>

          <div className="form-group">
            <label>Email nhận hóa đơn</label>
            {formData.receiptEmails.map((email, index) => (
              <div key={index} className="email-input-group">
                <input
                  type="email"
                  name={`receiptEmails.${index}`}
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Nhập email nhận hóa đơn..."
                />
                {formData.receiptEmails.length > 1 && (
                  <button
                    type="button"
                    className="remove-email-button"
                    onClick={() => removeReceiptEmail(index)}
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-email-button" onClick={addReceiptEmail}>
              Thêm email
            </button>
          </div>

          <div className="form-group">
            <label>Mã số thuế</label>
            <input
              type="text"
              name="taxNo"
              value={formData.taxNo}
              onChange={handleInputChange}
              placeholder="Nhập mã số thuế (10 chữ số)..."
            />
          </div>

          <button type="submit" className="submit-button">Đăng ký</button>
        </form>
      )}
    </div>
  );
};

export default ShopRegister;