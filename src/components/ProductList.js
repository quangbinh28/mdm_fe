import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/ProductList.css';

const ProductList = () => {
  const { addToCart } = useContext(CartContext);

  const products = [
    { id: 1, name: 'Áo thun', price: 100000, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Quần jeans', price: 200000, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Giày thể thao', price: 300000, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Túi xách', price: 150000, image: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="product-list">
      <h2>Sản phẩm nổi bật</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price.toLocaleString('vi-VN')}đ</p>
            <button
              className="add-button"
              onClick={() => addToCart(product)}
            >
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;