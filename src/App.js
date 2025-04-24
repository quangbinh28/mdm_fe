import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ShopRegister from './components/ShopRegister';
import ProductRegister from './components/ProductRegister';
import UserProfile from './components/UserProfile';
import OrderHistory from './components/OrderHistory'; // Thêm import

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
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop-register" element={<ShopRegister />} />
        <Route path="/product-register" element={<ProductRegister />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/order-history" element={<OrderHistory />} /> {/* Thêm route */}
      </Routes>
    </Router>
  );
};

export default App;