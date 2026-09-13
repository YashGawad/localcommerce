import React, { useState, useMemo } from 'react';
import styles from './AdminTable.module.css';

export default function AdminTable({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  filterSlot,
  actionSlot,
  initialPageSize = 10,
  keyExtractor = (item, index) => item.id || index,
  searchFilter,
  emptyMessage = 'No matching records found in platform registry.',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchTerm.toLowerCase()));
  }, [data, searchTerm, searchFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Top Bar: Search, Filters, Actions */}
      <div className={styles.topBar}>
        <div className={styles.searchAndFilterArea}>
          {searchFilter && (
            <div className={styles.searchBox}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchBtn}
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    close
                  </span>
                </button>
              )}
            </div>
          )}

          {filterSlot}
        </div>

        {actionSlot && (
          <div className={styles.actionsArea}>
            {actionSlot}
          </div>
        )}
      </div>

      {/* Table Body Container with Overflow Management */}
      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={styles.th}
                  style={{
                    textAlign: col.align || 'left',
                    width: col.width || 'auto',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#64748B',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#94A3B8' }}>
                      inbox
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      {emptyMessage}
                    </span>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        style={{
                          marginTop: '4px',
                          fontSize: '12px',
                          color: '#2563EB',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Clear search filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row, rowIdx)}
                  style={{
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={styles.td}
                      style={{
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={styles.paginationFooter}>
        <div>
          Showing{' '}
          <span style={{ fontWeight: 700, color: '#172033' }}>
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span style={{ fontWeight: 700, color: '#172033' }}>
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          of{' '}
          <span style={{ fontWeight: 700, color: '#172033' }}>
            {filteredData.length}
          </span>{' '}
          entries
        </div>

        <div className={styles.paginationControls}>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.pageSizeSelect}
            aria-label="Entries per page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`${styles.pageBtn} ${currentPage <= 1 ? styles.pageBtnDisabled : ''}`}
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_left
            </span>
            Prev
          </button>

          <span className={styles.pageIndicator}>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`${styles.pageBtn} ${currentPage >= totalPages ? styles.pageBtnDisabled : ''}`}
            aria-label="Next page"
          >
            Next
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
