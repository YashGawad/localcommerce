import React, { useState, useMemo } from 'react';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessCategoriesPage() {
  const { currentStore, storeProducts, categories, addCategory, updateCategory, deleteCategory } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('shopping_basket');
  const [categoryStatus, setCategoryStatus] = useState('Active');
  const [validationError, setValidationError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Delete confirmation state
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Compute products count per category dynamically from current store
  const categoryStats = useMemo(() => {
    const counts = {};
    storeProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [storeProducts]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('shopping_basket');
    setCategoryStatus('Active');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon || 'category');
    setCategoryStatus(cat.status || 'Active');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setValidationError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          icon: categoryIcon,
          status: categoryStatus,
        });
        setFeedback(`Category "${categoryName}" updated successfully!`);
      } else {
        await addCategory({
          name: categoryName.trim(),
          icon: categoryIcon,
          status: categoryStatus,
        });
        setFeedback(`Category "${categoryName}" added to catalog!`);
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error('Category save error:', err);
      setValidationError(err.message || 'Failed to save category.');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory.id);
    setFeedback(`Category "${deletingCategory.name}" removed.`);
    setDeletingCategory(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  const availableIcons = [
    { name: 'shopping_basket', label: 'Groceries' },
    { name: 'bakery_dining', label: 'Bakery' },
    { name: 'nutrition', label: 'Produce' },
    { name: 'local_cafe', label: 'Beverages' },
    { name: 'fastfood', label: 'Snacks' },
    { name: 'health_and_safety', label: 'Personal Care' },
    { name: 'cleaning_services', label: 'Home Care' },
    { name: 'inventory_2', label: 'General' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000F3F',
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Store Categories
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
            Organize products into categories for easier navigation and discovery in {currentStore?.name}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="primary" icon="add" onClick={handleOpenAdd}>
            Add Category
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            color: '#065F46',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
          {feedback}
        </div>
      )}

      {/* SEARCH BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              color: '#64748B',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 38px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '13px',
              color: '#172033',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '13px', color: '#64748B' }}>
          Showing <strong>{filteredCategories.length}</strong> categories
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Category
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  URL Slug
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Store Products Count
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No categories found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const productCount = categoryStats[cat.slug] || 0;

                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Icon & Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: cat.color || '#EFF6FF',
                              color: cat.iconColor || '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                              {cat.icon || 'category'}
                            </span>
                          </span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#172554' }}>
                              {cat.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#64748B' }}>
                        /{cat.slug}
                      </td>

                      {/* Products Count */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: productCount > 0 ? '#EFF6FF' : '#F1F5F9',
                            color: productCount > 0 ? '#1E40AF' : '#64748B',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {productCount} {productCount === 1 ? 'product' : 'products'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant={cat.status === 'Inactive' ? 'neutral' : 'success'} size="sm">
                          {cat.status || 'Active'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              cursor: 'pointer',
                              display: 'inline-flex',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingCategory(cat)}
                            title="Delete Category"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#DC2626',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FCA5A5',
                              cursor: 'pointer',
                              display: 'inline-flex',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
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
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                {editingCategory ? 'Edit Store Category' : 'Add Store Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                  Category Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="e.g. Organic Dairy & Eggs"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: validationError ? '1px solid #DC2626' : '1px solid #E2E8F0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {validationError && (
                  <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>
                    {validationError}
                  </div>
                )}
              </div>

              {/* Icon Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                  Category Icon
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableIcons.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setCategoryIcon(ic.name)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: categoryIcon === ic.name ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        backgroundColor: categoryIcon === ic.name ? '#EFF6FF' : '#F8FAFC',
                        color: categoryIcon === ic.name ? '#2563EB' : '#64748B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={ic.label}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                        {ic.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Active">Active (Visible in catalog)</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                <Button variant="primary" type="submit">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
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
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#DC2626' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#172554' }}>
                Delete Category?
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '16px 0 12px' }}>
              Are you sure you want to delete <strong>{deletingCategory.name}</strong>?
            </p>

            {(categoryStats[deletingCategory.slug] || 0) > 0 && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#B45309',
                  fontSize: '12px',
                  marginBottom: '16px',
                }}
              >
                <strong>Notice:</strong> This category currently contains{' '}
                <strong>{categoryStats[deletingCategory.slug]} product(s)</strong> in {currentStore?.name}. Deleting this category will unassign those products from this group, but will NOT delete the products themselves.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
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
                onClick={handleConfirmDelete}
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
