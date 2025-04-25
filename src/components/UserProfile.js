import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();

  // Lấy dữ liệu người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Dữ liệu mặc định nếu không có trong localStorage
  const defaultUserData = {
    customerId: '',
    customerPhone: '',
    customerName: '',
    customerEmail: '',
    customerGender: '',
    customerAvatar: '',
    customerDOB: '',
    customerAddress: [{ houseNumber: '', street: '', city: '', ward: '', district: '' }], // Chuyển thành mảng
    customerCards: {
      cardNumber: '',
      bank: '',
      code: '',
      expiredIn: ''
    }
  };

  // Khởi tạo dữ liệu ban đầu từ user hoặc giá trị mặc định
  const initialUserData = user
    ? {
        customerId: user.customerId || defaultUserData.customerId,
        customerPhone: user.customerPhone || defaultUserData.customerPhone,
        customerName: user.customerName || defaultUserData.customerName,
        customerEmail: user.customerEmail || defaultUserData.customerEmail,
        customerGender: user.customerGender || defaultUserData.customerGender,
        customerAvatar: user.customerAvatar || defaultUserData.customerAvatar,
        customerDOB: user.customerDOB || defaultUserData.customerDOB,
        customerAddress: Array.isArray(user.customerAddress) && user.customerAddress.length > 0
          ? user.customerAddress
          : defaultUserData.customerAddress, // Đảm bảo là mảng
        customerCards: Array.isArray(user.customerCards) && user.customerCards[0] && typeof user.customerCards[0] === 'object'
          ? { ...defaultUserData.customerCards, ...user.customerCards[0] }
          : defaultUserData.customerCards
      }
    : defaultUserData;

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(user?.customerAvatar || '');
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    if (!user) {
      setError('Vui lòng đăng nhập để xem thông tin!');
      navigate('/login');
    }
  }, [user, navigate]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('customerAddress')) {
      const [_, index, field] = name.split('.'); // customerAddress.0.houseNumber -> index=0, field=houseNumber
      const newAddresses = [...userData.customerAddress];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      setUserData({ ...userData, customerAddress: newAddresses });
    } else if (name.includes('customerCards')) {
      const field = name.split('.')[1];
      setUserData({
        ...userData,
        customerCards: { ...userData.customerCards, [field]: value }
      });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  // Thêm địa chỉ mới
  const addAddress = () => {
    setUserData({
      ...userData,
      customerAddress: [
        ...userData.customerAddress,
        { houseNumber: '', street: '', city: '', ward: '', district: '' }
      ]
    });
  };

  // Xóa địa chỉ
  const removeAddress = (index) => {
    if (userData.customerAddress.length === 1) {
      setError('Phải có ít nhất một địa chỉ!');
      return;
    }
    setUserData({
      ...userData,
      customerAddress: userData.customerAddress.filter((_, i) => i !== index)
    });
  };

  // Xử lý upload file avatar
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // Xử lý submit cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const customerAddress = userData.customerAddress || defaultUserData.customerAddress;
    const customerCards = userData.customerCards || defaultUserData.customerCards;

    // Chuẩn bị dữ liệu gửi đi
    const formDataToSend = new FormData();
    formDataToSend.append('customerId', userData.customerId);
    formDataToSend.append('phoneNumber', userData.customerPhone);
    formDataToSend.append('name', userData.customerName);
    formDataToSend.append('email', userData.customerEmail);
    formDataToSend.append('gender', userData.customerGender);
    if (newAvatarFile) {
      formDataToSend.append('avatarImg', newAvatarFile);
    }
    formDataToSend.append('DOB', userData.customerDOB);
    formDataToSend.append('addresses', JSON.stringify(customerAddress)); // Gửi mảng địa chỉ
    formDataToSend.append('cards', JSON.stringify([customerCards]));

    try {
      await axios.put(`http://localhost:8080/api/users/update/${user.customerId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Cập nhật lại localStorage với dữ liệu mới
      const updatedUser = {
        ...user,
        customerName: userData.customerName,
        customerEmail: userData.customerEmail,
        customerGender: userData.customerGender,
        customerAvatar: userData.customerAvatar,
        customerDOB: userData.customerDOB,
        customerAddress: customerAddress, // Lưu mảng địa chỉ
        customerCards: [customerCards]
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setNewAvatarFile(null);
    } catch (err) {
      setError('Cập nhật thông tin thất bại! Vui lòng thử lại.');
    }
  };

  if (!user) {
    return null;
  }

  const customerAddress = userData.customerAddress || defaultUserData.customerAddress;
  const customerCards = userData.customerCards || defaultUserData.customerCards;

  return (
    <div className="user-profile-container">
      <h2>Thông tin người dùng</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="user-profile-form">
        {/* Số điện thoại (chỉ đọc) */}
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            value={userData.customerPhone}
            readOnly
            className="readonly-input"
          />
        </div>

        {/* Họ tên */}
        <div className="form-group">
          <label>Họ tên</label>
          {isEditing ? (
            <input
              type="text"
              name="customerName"
              value={userData.customerName}
              onChange={handleInputChange}
              placeholder="Nhập họ tên..."
            />
          ) : (
            <p>{userData.customerName || 'Chưa cập nhật'}</p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          {isEditing ? (
            <input
              type="email"
              name="customerEmail"
              value={userData.customerEmail}
              onChange={handleInputChange}
              placeholder="Nhập email..."
            />
          ) : (
            <p>{userData.customerEmail || 'Chưa cập nhật'}</p>
          )}
        </div>

        {/* Giới tính */}
        <div className="form-group">
          <label>Giới tính</label>
          {isEditing ? (
            <select
              name="customerGender"
              value={userData.customerGender}
              onChange={handleInputChange}
            >
              <option value="">Chọn giới tính...</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          ) : (
            <p>{userData.customerGender || 'Chưa cập nhật'}</p>
          )}
        </div>

        {/* Ảnh đại diện */}
        <div className="form-group">
          <label>Ảnh đại diện</label>
          <div className="avatar-preview">
            <img
              src={
                previewAvatar.startsWith('blob:')
                  ? previewAvatar
                  : `http://localhost:8080${previewAvatar}`
              }
              alt="Avatar"
              onError={(e) => (e.target.src = defaultUserData.customerAvatar)}
            />
          </div>
          {isEditing && (
            <input
              type="file"
              name="customerAvatar"
              onChange={handleFileChange}
            />
          )}
        </div>

        {/* Ngày sinh */}
        <div className="form-group">
          <label>Ngày sinh</label>
          {isEditing ? (
            <input
              type="date"
              name="customerDOB"
              value={userData.customerDOB}
              onChange={handleInputChange}
            />
          ) : (
            <p>{userData.customerDOB || 'Chưa cập nhật'}</p>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="form-group">
          <label>Địa chỉ</label>
          {isEditing ? (
            <>
              {customerAddress.map((address, index) => (
                <div key={index} className="address-group">
                  <input
                    type="text"
                    name={`customerAddress.${index}.houseNumber`}
                    value={address.houseNumber}
                    onChange={handleInputChange}
                    placeholder="Số nhà..."
                  />
                  <input
                    type="text"
                    name={`customerAddress.${index}.street`}
                    value={address.street}
                    onChange={handleInputChange}
                    placeholder="Đường..."
                  />
                  <input
                    type="text"
                    name={`customerAddress.${index}.city`}
                    value={address.city}
                    onChange={handleInputChange}
                    placeholder="Thành phố..."
                  />
                  <input
                    type="text"
                    name={`customerAddress.${index}.ward`}
                    value={address.ward}
                    onChange={handleInputChange}
                    placeholder="Phường..."
                  />
                  <input
                    type="text"
                    name={`customerAddress.${index}.district`}
                    value={address.district}
                    onChange={handleInputChange}
                    placeholder="Quận..."
                  />
                  <button
                    type="button"
                    className="remove-address-button"
                    onClick={() => removeAddress(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-address-button"
                onClick={addAddress}
              >
                Thêm địa chỉ
              </button>
            </>
          ) : (
            <div>
              {customerAddress.length > 0 ? (
                customerAddress.map((address, index) => (
                  <p key={index}>
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
                      : 'Chưa cập nhật'}
                  </p>
                ))
              ) : (
                <p>Chưa cập nhật</p>
              )}
            </div>
          )}
        </div>

        {/* Thẻ ngân hàng */}
        <div className="form-group">
          <label>Thẻ ngân hàng</label>
          {isEditing ? (
            <>
              <input
                type="text"
                name="customerCards.cardNumber"
                value={customerCards.cardNumber}
                onChange={handleInputChange}
                placeholder="Số thẻ..."
              />
              <input
                type="text"
                name="customerCards.bank"
                value={customerCards.bank}
                onChange={handleInputChange}
                placeholder="Ngân hàng..."
              />
              <input
                type="text"
                name="customerCards.code"
                value={customerCards.code}
                onChange={handleInputChange}
                placeholder="Mã CVV..."
              />
              <input
                type="text"
                name="customerCards.expiredIn"
                value={customerCards.expiredIn}
                onChange={handleInputChange}
                placeholder="Hết hạn (MM/YYYY)..."
              />
            </>
          ) : (
            <p>
              {customerCards.cardNumber && customerCards.bank
                ? `Số thẻ: ${customerCards.cardNumber} | Ngân hàng: ${customerCards.bank} | Hết hạn: ${customerCards.expiredIn}`
                : 'Chưa cập nhật'}
            </p>
          )}
        </div>

        <div className="form-actions">
          {!isEditing && (
            <button
              type="button"
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </button>
          )}

          {isEditing && (
            <>
              <button type="submit" className="save-button">
                Lưu
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setUserData(initialUserData);
                  setNewAvatarFile(null);
                }}
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;