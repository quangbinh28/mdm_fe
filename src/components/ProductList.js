import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductList.css';

const ProductList = () => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const [isSearching, setIsSearching] = useState(false);

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
      setTotalPages(1); // API tìm kiếm chưa hỗ trợ phân trang
      setLoading(false);
    } catch (err) {
      setError('Không tìm thấy sản phẩm nào khớp với tên! Vui lòng thử lại.');
      setLoading(false);
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
    setPageNumber(0); // Reset về trang đầu khi tìm kiếm
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
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.prodName,
                      price: product.prodPrice,
                      image: getProductImage(product),
                    })}
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