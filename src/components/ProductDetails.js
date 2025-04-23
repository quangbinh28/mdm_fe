import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); // State để lưu biến thể đã chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.customerId;

  // Lấy thông tin sản phẩm từ API
  const fetchProduct = async () => {
    console.log('Fetching product with id:', id);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/product/${id}`);
      console.log('API response:', response.data);
      setProduct(response.data);
      // Đặt biến thể mặc định là biến thể đầu tiên (nếu có)
      if (response.data.variants && response.data.variants.length > 0) {
        setSelectedVariant(response.data.variants[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('API error:', err);
      setError('Không thể tải thông tin sản phẩm! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async () => {
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    if (!product.shopName) {
      setError('Không thể thêm sản phẩm vào giỏ hàng vì thiếu thông tin cửa hàng!');
      return;
    }

    if (!selectedVariant) {
      setError('Vui lòng chọn một biến thể trước khi thêm vào giỏ hàng!');
      return;
    }

    const cartItem = {
      productId: product.id,
      productName: `${product.name} - ${selectedVariant.name}`, // Thêm tên biến thể vào productName
      productSKU: "unknown",
      quantity: 1,
      price: selectedVariant.price || 0,
      productImg: product.image,
      variantName: selectedVariant.name
    };

    try {
      await axios.post(
        `http://localhost:8080/api/cart/add-item/${userId}/${product.shopName}`,
        cartItem
      );
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (err) {
      setError('Không thể thêm sản phẩm vào giỏ hàng! Vui lòng thử lại.');
    }
  };

  // Gọi API khi component mount hoặc id thay đổi
  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    if (id) {
      fetchProduct();
    } else {
      setError('Không tìm thấy ID sản phẩm!');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="product-details">Đang tải thông tin sản phẩm...</div>;
  }

  if (error) {
    return <div className="product-details"><p className="error">{error}</p></div>;
  }

  if (!product) {
    return <div className="product-details"><p>Không tìm thấy sản phẩm.</p></div>;
  }

  return (
    <div className="product-details">
      <h2>Chi tiết sản phẩm</h2>
      <div className="product-content">
        <div className="product-image">
          <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} />
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="shop-name"><strong>Cửa hàng:</strong> {product.shopName}</p>
          <p><strong>Thương hiệu:</strong> {product.brand || 'Không có'}</p>
          <p><strong>Danh mục:</strong> {product.category.map(cat => cat.name).join(', ') || 'Không có'}</p>
          <p><strong>Mô tả:</strong> {product.description || 'Không có mô tả'}</p>
          <div className="variants">
            <h4>Biến thể sản phẩm:</h4>
            {product.variants.length > 0 ? (
              <>
                <table className="variant-table">
                  <thead>
                    <tr>
                      <th>Tên biến thể</th>
                      <th>Kích thước</th>
                      <th>Màu sắc</th>
                      <th>Tồn kho</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.id}>
                        <td>{variant.name}</td>
                        <td>{variant.size || 'N/A'}</td>
                        <td>{variant.color || 'N/A'}</td>
                        <td>{variant.quantity}</td>
                        <td>{variant.price.toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="variant-selector">
                  <label>Chọn biến thể: </label>
                  <select
                    value={selectedVariant?.id || ''}
                    onChange={(e) => {
                      const variant = product.variants.find(v => v.id === parseInt(e.target.value));
                      setSelectedVariant(variant);
                    }}
                  >
                    {product.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name} - {variant.price.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <p>Không có biến thể.</p>
            )}
          </div>
          <div className="actions">
            <button className="add-to-cart" onClick={addToCart}>
              Thêm vào giỏ hàng
            </button>
            <Link to="/" className="back-link">Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;