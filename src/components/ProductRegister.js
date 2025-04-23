import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductRegister.css';

const ProductRegister = () => {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productCategories: [{ id: '', name: '' }],
    brand: '',
    productVariants: [{ id: 1, name: '', size: '', color: '', quantity: 0, price: 0 }],
    file: null,
    shopId: '',
    shopName: '',
  });
  const [categories, setCategories] = useState([]); // Danh sách danh mục từ API
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.customerId;

  // Lấy thông tin shop từ API
  const fetchShop = async () => {
    if (!userId) {
      setError('Vui lòng đăng nhập để lấy thông tin cửa hàng!');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8080/api/shop/get-shop/${userId}`);
      const shopData = response.data;
      if (shopData) {
        setFormData((prev) => ({
          ...prev,
          shopId: shopData.shopId,
          shopName: shopData.shopName
        }));
      } else {
        setError('Bạn chưa có cửa hàng! Vui lòng tạo cửa hàng trước.');
      }
    } catch (err) {
      setError('Không thể tải thông tin cửa hàng! Vui lòng thử lại.');
    }
  };

  // Lấy danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/category/all-categories');
      setCategories(response.data);
    } catch (err) {
      setError('Không thể tải danh sách danh mục! Vui lòng thử lại.');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchShop();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('productCategories')) {
      const [field, index] = name.split('.');
      const newCategories = [...formData.productCategories];
      const selectedCategory = categories.find(cat => cat.code === value);
      newCategories[index] = {
        id: selectedCategory ? selectedCategory.code : '',
        name: selectedCategory ? selectedCategory.name : ''
      };
      setFormData((prev) => ({ ...prev, productCategories: newCategories }));
    } else if (name.includes('productVariants')) {
      const [field, index, subField] = name.split('.');
      const newVariants = [...formData.productVariants];
      newVariants[index][subField] = subField === 'quantity' || subField === 'price' ? parseFloat(value) || 0 : value;
      setFormData((prev) => ({ ...prev, productVariants: newVariants }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      productCategories: [
        ...prev.productCategories,
        { id: '', name: '' },
      ],
    }));
  };

  const removeCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      productCategories: prev.productCategories.filter((_, i) => i !== index),
    }));
  };

  const moveCategoryUp = (index) => {
    if (index === 0) return;
    const newCategories = [...formData.productCategories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    setFormData((prev) => ({ ...prev, productCategories: newCategories }));
  };

  const moveCategoryDown = (index) => {
    if (index === formData.productCategories.length - 1) return;
    const newCategories = [...formData.productCategories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    setFormData((prev) => ({ ...prev, productCategories: newCategories }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      productVariants: [
        ...prev.productVariants,
        { id: prev.productVariants.length + 1, name: '', size: '', color: '', quantity: 0, price: 0 },
      ],
    }));
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      productVariants: prev.productVariants.filter((_, i) => i !== index),
    }));
  };

  const moveVariantUp = (index) => {
    if (index === 0) return;
    const newVariants = [...formData.productVariants];
    [newVariants[index - 1], newVariants[index]] = [newVariants[index], newVariants[index - 1]];
    setFormData((prev) => ({ ...prev, productVariants: newVariants }));
  };

  const moveVariantDown = (index) => {
    if (index === formData.productVariants.length - 1) return;
    const newVariants = [...formData.productVariants];
    [newVariants[index], newVariants[index + 1]] = [newVariants[index + 1], newVariants[index]];
    setFormData((prev) => ({ ...prev, productVariants: newVariants }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Vui lòng đăng nhập để đăng ký sản phẩm!');
      navigate('/login');
      return;
    }

    const { productName, productCategories, productVariants, file, shopId, shopName } = formData;

    // Validate basic fields
    if (!productName) {
      setError('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (productCategories.length === 0) {
      setError('Vui lòng thêm ít nhất một danh mục!');
      return;
    }
    if (productVariants.length === 0) {
      setError('Vui lòng thêm ít nhất một biến thể sản phẩm!');
      return;
    }
    if (!file) {
      setError('Vui lòng chọn hình ảnh sản phẩm!');
      return;
    }
    if (!shopId) {
      setError('Bạn chưa có cửa hàng! Vui lòng tạo cửa hàng trước.');
      return;
    }

    // Validate productCategories
    for (let i = 0; i < productCategories.length; i++) {
      const category = productCategories[i];
      if (!category.id) {
        setError(`Vui lòng chọn danh mục thứ ${i + 1}!`);
        return;
      }
    }

    // Validate unique category IDs
    const categoryIds = productCategories.map(cat => cat.id);
    const hasDuplicateCategory = categoryIds.some((id, index) => id && categoryIds.indexOf(id) !== index);
    if (hasDuplicateCategory) {
      setError('Danh mục không được trùng lặp!');
      return;
    }

    // Validate productVariants
    for (let i = 0; i < productVariants.length; i++) {
      const variant = productVariants[i];
      if (!variant.name) {
        setError(`Vui lòng nhập tên biến thể thứ ${i + 1}!`);
        return;
      }
      if (variant.quantity < 1) {
        setError(`Tồn kho của biến thể thứ ${i + 1} phải lớn hơn hoặc bằng 1!`);
        return;
      }
      if (variant.price < 1) {
        setError(`Giá của biến thể thứ ${i + 1} phải lớn hơn hoặc bằng 1!`);
        return;
      }
    }

    // Tạo shopInfo với shopId và shopName
    const shopInfo = {
      shopId: shopId,
      shopName: shopName
    };

    // Prepare FormData for multipart/form-data
    const formDataToSend = new FormData();
    formDataToSend.append('productName', productName);
    formDataToSend.append('productDescription', formData.productDescription || '');
    formDataToSend.append('productCategories', JSON.stringify(productCategories));
    formDataToSend.append('brand', formData.brand || '');
    formDataToSend.append('productVariants', JSON.stringify(productVariants));
    formDataToSend.append('shopInfo', JSON.stringify(shopInfo));
    formDataToSend.append('file', file);

    try {
      await axios.post('http://localhost:8080/api/product/insert', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Đăng ký sản phẩm thành công');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký sản phẩm thất bại!');
    }
  };

  return (
    <div className="product-register-container">
      <h2>Đăng ký sản phẩm</h2>
      {error && <p className="error">{error}</p>}
      {!user ? (
        <p>Vui lòng <Link to="/login">đăng nhập</Link> để đăng ký sản phẩm.</p>
      ) : (
        <form onSubmit={handleSubmit} className="product-register-form">
          <div className="form-group">
            <label>Tên sản phẩm *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Nhập tên sản phẩm..."
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả sản phẩm</label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleInputChange}
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          <div className="form-group">
            <label>Cửa hàng *</label>
            <input
              type="text"
              value={formData.shopName}
              readOnly
              placeholder="Tên cửa hàng..."
              required
            />
          </div>

          <div className="form-group">
            <label>Danh mục sản phẩm *</label>
            {formData.productCategories.map((category, index) => (
              <div key={index} className="category-group">
                <select
                  name={`productCategories.${index}`}
                  value={category.id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="category-actions">
                  <span
                    className="sort-icon"
                    onClick={() => {
                      moveCategoryUp(index);
                      moveCategoryDown(index);
                    }}
                  >
                    ↕
                  </span>
                  {formData.productCategories.length > 1 && (
                    <span className="remove-icon" onClick={() => removeCategory(index)}>
                      ✕
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="add-category-button" onClick={addCategory}>
              Thêm danh mục
            </button>
          </div>

          <div className="form-group">
            <label>Thương hiệu</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="Nhập thương hiệu..."
            />
          </div>

          <div className="form-group">
            <label>Biến thể sản phẩm *</label>
            <div className="variant-header">
              <span>Tên biến thể</span>
              <span>Kích thước</span>
              <span>Màu sắc</span>
              <span>Tồn kho</span>
              <span>Giá</span>
              <span></span>
            </div>
            {formData.productVariants.map((variant, index) => (
              <div key={variant.id} className="variant-group">
                <input
                  type="text"
                  name={`productVariants.${index}.name`}
                  value={variant.name}
                  onChange={handleInputChange}
                  placeholder="Tên biến thể..."
                  required
                />
                <input
                  type="text"
                  name={`productVariants.${index}.size`}
                  value={variant.size}
                  onChange={handleInputChange}
                  placeholder="Kích thước..."
                />
                <input
                  type="text"
                  name={`productVariants.${index}.color`}
                  value={variant.color}
                  onChange={handleInputChange}
                  placeholder="Màu sắc..."
                />
                <input
                  type="number"
                  name={`productVariants.${index}.quantity`}
                  value={variant.quantity}
                  onChange={handleInputChange}
                  placeholder="Tồn kho..."
                  required
                />
                <input
                  type="number"
                  name={`productVariants.${index}.price`}
                  value={variant.price}
                  onChange={handleInputChange}
                  placeholder="Giá..."
                  required
                />
                <div className="variant-actions">
                  <span
                    className="sort-icon"
                    onClick={() => {
                      moveVariantUp(index);
                      moveVariantDown(index);
                    }}
                  >
                    ↕
                  </span>
                  {formData.productVariants.length > 1 && (
                    <span className="remove-icon" onClick={() => removeVariant(index)}>
                      ✕
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="add-variant-button" onClick={addVariant}>
              Thêm biến thể
            </button>
          </div>

          <div className="form-group">
            <label>Hình ảnh sản phẩm *</label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">Đăng ký</button>
        </form>
      )}
    </div>
  );
};

export default ProductRegister;