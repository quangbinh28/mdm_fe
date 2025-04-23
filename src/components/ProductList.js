import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.customerId;

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/product/all-products?pageSize=${pageSize}&pageNumber=${pageNumber}`);
      setProducts(response.data);
      setTotalPages(response.data.length < pageSize ? pageNumber + 1 : pageNumber + 2);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const fetchProductsByName = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/product/search?name=${searchTerm}`);
      setProducts(response.data);
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      setError('Không tìm thấy sản phẩm nào khớp với tên! Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    // Kiểm tra nếu người dùng chưa đăng nhập
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login'); // Chuyển hướng đến trang đăng nhập
      return;
    }

    const cartItem = {
      productId: product.id,
      productName: product.prodName,
      price: product.prodPrice,
      image: getProductImage(product),
      quantity: 1
    };

    try {
      await axios.post(`http://localhost:8080/cart/add-item/${userId}`, cartItem);
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (err) {
      setError('Không thể thêm sản phẩm vào giỏ hàng! Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (isSearching) {
      fetchProductsByName();
    } else {
      fetchAllProducts();
    }
  }, [pageNumber, isSearching]);

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchButton = () => {
    setIsSearching(true);
    setPageNumber(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setPageNumber(0);
  };

  const getProductImage = (product) => {
    return product.prodImg || 'https://via.placeholder.com/150';
  };

  if (loading) {
    return <div className="product-list">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="product-list"><p className="error">{error}</p></div>;
  }

  return (
    <div className="product-list">
      <h2>Sản phẩm nổi bật</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm theo tên..."
          value={searchTerm}
          onChange={handleSearchInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearchButton();
            }
          }}
        />
        <button className="search-button" onClick={handleSearchButton}>
          Tìm kiếm
        </button>
        <button className="clear-button" onClick={handleClearSearch}>
          Xóa
        </button>
      </div>
      {products.length === 0 ? (
        <p>Không có sản phẩm nào để hiển thị.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <img src={getProductImage(product)} alt={product.prodName} />
                <h3 className="product-name">{product.prodName}</h3>
                <p className="price">{product.prodPrice.toLocaleString('vi-VN')}đ</p>
                <div className="button-group">
                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                  >
                    Thêm vào giỏ
                  </button>
                  <Link to={`/products/${product.id}`} className="detail-button">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {!isSearching && (
            <div className="pagination">
              <button
                onClick={() => setPageNumber(prev => Math.max(0, prev - 1))}
                disabled={pageNumber === 0}
              >
                Trang trước
              </button>
              <span>Trang {pageNumber + 1} / {totalPages}</span>
              <button
                onClick={() => setPageNumber(prev => prev + 1)}
                disabled={pageNumber + 1 >= totalPages}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;