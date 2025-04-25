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
    customerAddress: [{ houseNumber: '', street: '', city: '', ward: '', district: '' }],
    customerCards: [{ cardNumber: '', bank: '', code: '', expiredIn: '' }], // Chuyển thành mảng
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
          : defaultUserData.customerAddress,
        customerCards: Array.isArray(user.customerCards) && user.customerCards.length > 0
          ? user.customerCards
          : defaultUserData.customerCards, // Đảm bảo là mảng
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
      const [_, index, field] = name.split('.');
      const newAddresses = [...userData.customerAddress];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      setUserData({ ...userData, customerAddress: newAddresses });
    } else if (name.includes('customerCards')) {
      const [_, index, field] = name.split('.'); // customerCards.0.cardNumber -> index=0, field=cardNumber
      const newCards = [...userData.customerCards];
      newCards[index] = { ...newCards[index], [field]: value };
      setUserData({ ...userData, customerCards: newCards });
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

  // Thêm thẻ ngân hàng mới
  const addCard = () => {
    setUserData({
      ...userData,
      customerCards: [
        ...userData.customerCards,
        { cardNumber: '', bank: '', code: '', expiredIn: '' }
      ]
    });
  };

  // Xóa thẻ ngân hàng
  const removeCard = (index) => {
    if (userData.customerCards.length === 1) {
      setError('Phải có ít nhất một thẻ ngân hàng!');
      return;
    }
    setUserData({
      ...userData,
      customerCards: userData.customerCards.filter((_, i) => i !== index)
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
    formDataToSend.append('addresses', JSON.stringify(customerAddress));
    formDataToSend.append('cards', JSON.stringify(customerCards)); // Gửi mảng thẻ ngân hàng

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
        customerAddress: customerAddress,
        customerCards: customerCards // Lưu mảng thẻ ngân hàng
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
              {customerCards.map((card, index) => (
                <div key={index} className="card-group">
                  <input
                    type="text"
                    name={`customerCards.${index}.cardNumber`}
                    value={card.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Số thẻ..."
                  />
                  <input
                    type="text"
                    name={`customerCards.${index}.bank`}
                    value={card.bank}
                    onChange={handleInputChange}
                    placeholder="Ngân hàng..."
                  />
                  <input
                    type="text"
                    name={`customerCards.${index}.code`}
                    value={card.code}
                    onChange={handleInputChange}
                    placeholder="Mã CVV..."
                  />
                  <input
                    type="text"
                    name={`customerCards.${index}.expiredIn`}
                    value={card.expiredIn}
                    onChange={handleInputChange}
                    placeholder="Hết hạn (MM/YYYY)..."
                  />
                  <button
                    type="button"
                    className="remove-card-button"
                    onClick={() => removeCard(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-card-button"
                onClick={addCard}
              >
                Thêm thẻ
              </button>
            </>
          ) : (
            <div>
              {customerCards.length > 0 ? (
                customerCards.map((card, index) => (
                  <p key={index}>
                    {card.cardNumber && card.bank
                      ? `Số thẻ: ${card.cardNumber} | Ngân hàng: ${card.bank} | Hết hạn: ${card.expiredIn}`
                      : 'Chưa cập nhật'}
                  </p>
                ))
              ) : (
                <p>Chưa cập nhật</p>
              )}
            </div>
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