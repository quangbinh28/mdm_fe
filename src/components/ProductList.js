import React from 'react';
import '../styles/ProductList.css';

const ProductList = () => {
  const products = [
    { id: 1, name: 'Áo thun', price: '100.000đ', image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Quần jeans', price: '200.000đ', image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Giày thể thao', price: '300.000đ', image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Túi xách', price: '150.000đ', image: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="product-list">
      <h2>Sản phẩm nổi bật</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <button className="add-button">Thêm vào giỏ</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;