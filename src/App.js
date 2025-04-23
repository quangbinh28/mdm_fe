import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails'; // Thêm import
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ShopRegister from './components/ShopRegister';
import ProductRegister from './components/ProductRegister';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Banner />
              <ProductList />
            </div>
          }
        />
        <Route path="/products/:id" element={<ProductDetails />} /> {/* Thêm route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop-register" element={<ShopRegister />} />
        <Route path="/product-register" element={<ProductRegister />} />
      </Routes>
    </Router>
  );
};

export default App;