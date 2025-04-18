import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductList from './components/ProductList';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import ShopRegister from './components/ShopRegister';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop-register" element={<ShopRegister />} />
      </Routes>
    </Router>
  );
};

export default App;