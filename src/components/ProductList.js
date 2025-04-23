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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/product/all-products?pageSize=10&pageNumber=0');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm! Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductPrice = (product) => {
    return product.prodPrice || 0;
  };

  const getProductImage = (product) => {
    return product.prodImg || 'https://via.placeholder.com/150'; // Hình ảnh mặc định nếu không có
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
      {products.length === 0 ? (
        <p>Không có sản phẩm nào để hiển thị.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.productId} className="product-item">
              <img src={getProductImage(product)} alt={product.productName} />
              <h3>{product.productName}</h3>
              <p className="price">{getProductPrice(product).toLocaleString('vi-VN')}đ</p>
              <div className="button-group">
                <button
                  className="add-button"
                  onClick={() => addToCart({
                    id: product.productId,
                    name: product.productName,
                    price: getProductPrice(product),
                    image: getProductImage(product),
                  })}
                >
                  Thêm vào giỏ
                </button>
                <Link to={`/products/${product.productId}`} className="detail-button">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;