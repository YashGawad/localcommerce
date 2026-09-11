import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessAddProductPage() {
  const { currentStore, allGlobalProducts, categories, addProduct } = useCatalog();
  const navigate = useNavigate();

  const [selectedGlobalId, setSelectedGlobalId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'groceries',
    brand: '',
    unit: '',
    description: '',
    image: '',
    price: '',
    cost: '',
    mrp: '',
    sku: '',
    barcode: '',
    stock: '15',
    lowStockThreshold: '5',
    aisle: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // When a merchant selects a global catalog item, pre-fill identity fields
  const handleSelectGlobalProduct = (e) => {
    const globalId = e.target.value;
    setSelectedGlobalId(globalId);

    if (!globalId) return;

    const globalProd = allGlobalProducts.find((p) => p.id === globalId);
    if (globalProd) {
      setFormData((prev) => ({
        ...prev,
        globalProductId: globalProd.id,
        title: globalProd.title,
        category: globalProd.category || 'groceries',
        brand: globalProd.brand || '',
        unit: globalProd.unit || '',
        description: globalProd.description || '',
        image: globalProd.image || '',
        mrp: globalProd.mrp ? String(globalProd.mrp) : '',
        price: globalProd.mrp ? String(Math.round(globalProd.mrp * 0.95)) : '',
        cost: globalProd.mrp ? String(Math.round(globalProd.mrp * 0.8)) : '',
        sku: `${currentStore?.id ? currentStore.id.slice(0, 3).toUpperCase() : 'STR'}-${globalProd.sku || 'ITEM'}`,
        barcode: globalProd.sku ? '890' + Math.floor(100000000 + Math.random() * 900000000) : '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Live margin calculation
  const marginPercent = (() => {
    const p = parseFloat(formData.price);
    const c = parseFloat(formData.cost);
    if (!p || p <= 0 || !c || c <= 0) return null;
    const margin = ((p - c) / p) * 100;
    return margin.toFixed(1);
  })();

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    const p = parseFloat(formData.price);
    if (isNaN(p) || p <= 0) {
      newErrors.price = 'Retail selling price must be greater than 0';
    }
    const s = parseInt(formData.stock, 10);
    if (isNaN(s) || s < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }
    const t = parseInt(formData.lowStockThreshold, 10);
    if (isNaN(t) || t < 0) {
      newErrors.lowStockThreshold = 'Low stock threshold must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedCategory = categories.find((c) => c.slug === formData.category);

    const newProduct = addProduct({
      ...formData,
      categoryName: matchedCategory ? matchedCategory.name : 'General',
      image:
        formData.image.trim() ||
        'https://placehold.co/400x400?text=' + encodeURIComponent(formData.title),
    });

    setSuccessMessage(`Product "${newProduct.title}" added to ${currentStore?.name} successfully!`);
    setTimeout(() => {
      navigate('/business/products');
    }, 900);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb & Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <Link to="/business/products" style={{ color: '#64748B', textDecoration: 'none' }}>
            Products
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: '#172554', fontWeight: 600 }}>Add Product</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#000F3F', letterSpacing: '-0.015em', margin: 0 }}>
          Add New Product
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
          List a new product in {currentStore?.name}'s catalog.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>check_circle</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{successMessage}</span>
        </div>
      )}

      {/* GLOBAL MASTER CATALOG LOOKUP HELPER */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '20px' }}>
            hub
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Universal Master Catalog Quick-Fill (Optional)
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#1E3A8A', margin: '6px 0 12px' }}>
          Select an established branded product from the universal catalog to auto-populate canonical details. Store price, cost, and stock remain strictly specific to your store.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedGlobalId}
            onChange={handleSelectGlobalProduct}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #93C5FD',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              color: '#1E3A8A',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Choose from Master Catalog or enter custom product below --</option>
            {allGlobalProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.unit}) - Brand: {p.brand}
              </option>
            ))}
          </select>
          {selectedGlobalId && (
            <button
              type="button"
              onClick={() => {
                setSelectedGlobalId('');
                setFormData((prev) => ({
                  ...prev,
                  title: '',
                  brand: '',
                  unit: '',
                  description: '',
                  image: '',
                  mrp: '',
                  sku: '',
                  barcode: '',
                }));
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                backgroundColor: '#FFFFFF',
                color: '#1E40AF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear Prefill
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* SECTION 1: BASIC INFORMATION */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px' }}>
            1. Basic Product Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Product Title <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Amul Taaza Homogenised Toned Milk"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.title ? '1px solid #DC2626' : '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
              {errors.title && (
                <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.title}</div>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Category <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Brand / Manufacturer
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Amul, ITC, Britannia"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>

            {/* Pack Size / Unit */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Pack Size / Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. 1 Litre Pouch, 500 g Loaf, 5 kg Pack"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>

            {/* Image URL */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Product Image URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Paste HTTPS image link or leave blank for placeholder"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Product Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of product features, storage, or handling instructions..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING & ECONOMICS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
              2. Store Pricing &amp; Economics
            </h2>
            {marginPercent !== null && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: parseFloat(marginPercent) >= 15 ? '#ECFDF5' : '#FFFBEB',
                  color: parseFloat(marginPercent) >= 15 ? '#047857' : '#B45309',
                }}
              >
                Estimated Gross Margin: {marginPercent}%
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Retail Price */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Selling Price (₹) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="55"
                min="1"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.price ? '1px solid #DC2626' : '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
              {errors.price && (
                <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.price}</div>
              )}
            </div>

            {/* Cost Price */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Purchase / Cost Price (₹)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="46"
                min="0"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>

            {/* MRP */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Maximum Retail Price MRP (₹)
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                placeholder="56"
                min="1"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: INVENTORY & IDENTIFIERS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px' }}>
            3. Inventory &amp; Stock Levels
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Store SKU */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Store SKU Code
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SHM-PRD-001"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Barcode */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Barcode / EAN-13
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="890126201005"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Initial Stock */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Initial Stock Quantity <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="20"
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.stock ? '1px solid #DC2626' : '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
              {errors.stock && (
                <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.stock}</div>
              )}
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Low Stock Threshold <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                placeholder="5"
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: errors.lowStockThreshold ? '1px solid #DC2626' : '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
              {errors.lowStockThreshold && (
                <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.lowStockThreshold}</div>
              )}
            </div>

            {/* Aisle / Shelf */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Aisle / Shelf Location
              </label>
              <input
                type="text"
                name="aisle"
                value={formData.aisle}
                onChange={handleChange}
                placeholder="Aisle 2 - Rack 4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                }}
              />
            </div>

            {/* Listing Status */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Listing Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  color: '#172033',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="Active">Active (Visible to customers)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Link to="/business/products">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" icon="save">
            Save &amp; Publish Listing
          </Button>
        </div>
      </form>
    </div>
  );
}
