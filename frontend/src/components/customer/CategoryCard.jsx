import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Customer Category Tile
 * Visual identity matches Stitch: compact, clear icon, department title, store count.
 */
export default function CategoryCard({ category, active = false }) {
  return (
    <Link
      to={`/categories/${category.slug}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        boxShadow: active ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
      className="category-card"
    >
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '8px',
          backgroundColor: category.color || '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: category.iconColor || '#2563EB',
          transition: 'transform 0.15s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          {category.icon || 'shopping_basket'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: active ? '#2563EB' : '#172033' }}>
          {category.name}
        </span>
        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
          {category.storesCount} stores
        </span>
      </div>
    </Link>
  );
}
