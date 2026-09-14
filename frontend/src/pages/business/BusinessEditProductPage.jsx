import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStore, storeProducts, updateProduct, deleteProduct, calculateStockStatus } = useCatalog();

  const product = storeProducts.find((p) => p.id === id);

  const [formData, setFormData] = useState(() => ({
    title: product?.title || '',
    price: String(product?.price || ''),
    cost: String(product?.cost || ''),
    mrp: String(product?.mrp || ''),
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    stock: String(product?.stock ?? 0),
    lowStockThreshold: String(product?.lowStockThreshold ?? 10),
    aisle: product?.aisle || '',
    status: product?.status || 'Active',
    description: product?.description || '',
    image: product?.image || '',
  }));

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554' }}>
          Product not found
        </h2>
        <p style={{ color: '#64748B', marginTop: '8px' }}>
          The requested product does not exist in {currentStore?.name}'s catalog.
        </p>
        <Link to="/business/products" style={{ marginTop: '16px', display: 'inline-block' }}>
          <Button variant="primary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Product title is required';
    const p = parseFloat(formData.price);
    if (isNaN(p) || p <= 0) newErrors.price = 'Selling price must be greater than 0';
    const s = parseInt(formData.stock, 10);
    if (isNaN(s) || s < 0) newErrors.stock = 'Stock must be 0 or greater';
    const t = parseInt(formData.lowStockThreshold, 10);
    if (isNaN(t) || t < 0) newErrors.lowStockThreshold = 'Low stock threshold must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updateProduct(product.id, {
        title: formData.title,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        mrp: parseFloat(formData.mrp) || parseFloat(formData.price),
        sku: formData.sku,
        barcode: formData.barcode,
        stock: parseInt(formData.stock, 10),
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
        aisle: formData.aisle,
        status: formData.status,
        description: formData.description,
        image: formData.image || product.image,
      });

      setToastMessage('Product changes saved successfully!');
      setTimeout(() => {
        navigate(`/business/products/${product.id}`);
      }, 800);
    } catch (err) {
      console.error('Failed to update product:', err);
      setApiError(err.message || 'Failed to update product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    navigate('/business/products');
  };

  const stockStatus = calculateStockStatus(formData.stock, formData.lowStockThreshold);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb & Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <Link to="/business/products" style={{ color: '#64748B', textDecoration: 'none' }}>
            Products
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <Link to={`/business/products/${product.id}`} style={{ color: '#64748B', textDecoration: 'none' }}>
            {product.title}
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: '#172554', fontWeight: 600 }}>Edit</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#000F3F', letterSpacing: '-0.015em', margin: 0 }}>
              Edit Product Listing
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
              Updating listing for {currentStore?.name}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="info" size="sm">
              Stock Status: {stockStatus}
            </Badge>
          </div>
        </div>
      </div>

      {toastMessage && (
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
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {apiError && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>error</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{apiError}</span>
        </div>
      )}

      {/* GLOBAL IDENTITY BANNER IF LINKED */}
      {product.globalProductId && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '20px' }}>
            verified
          </span>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            <strong>Universal Catalog Linked ({product.globalProductId}):</strong> Canonical brand, categorization, and nutrition identity are verified globally. Price, stock, SKU, and shelf location remain uniquely controlled by your store.
          </div>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Basic Info */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px' }}>
            Product Identification
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Listing Title <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Store SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Barcode / EAN-13
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Store Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
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

        {/* Pricing & Stock */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px' }}>
            Store Pricing &amp; Stock Levels
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Store Selling Price (₹) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Purchase / Cost Price (₹)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Current Stock Quantity <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Low Stock Threshold Alert <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                Aisle / Shelf Location
              </label>
              <input
                type="text"
                name="aisle"
                value={formData.aisle}
                onChange={handleChange}
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
                <option value="Active">Active (Visible in store)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            Delete Listing
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={`/business/products/${product.id}`}>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" icon="save" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#DC2626' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#172554' }}>
                Delete Product Listing?
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '16px 0 24px' }}>
              Are you sure you want to remove <strong>{product.title}</strong> from {currentStore?.name}'s catalog? This action will remove the local store listing.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
