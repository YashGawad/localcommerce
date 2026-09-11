
/**
 * AddressCard Component
 * Displays saved address with type pill, phone, landmark, default badge, and action buttons.
 * Supports both Profile Page view and Checkout Selection mode.
 */
export default function AddressCard({
  address,
  isSelected = false,
  isSelectable = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  if (!address) return null;

  const getIcon = (type = '') => {
    const lower = type.toLowerCase();
    if (lower.includes('home')) return 'home_pin';
    if (lower.includes('work') || lower.includes('office')) return 'business';
    if (lower.includes('parent') || lower.includes('relative')) return 'family_restroom';
    return 'location_on';
  };

  return (
    <div
      onClick={isSelectable && onSelect ? () => onSelect(address) : undefined}
      style={{
        backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        cursor: isSelectable ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: isSelected ? '#DBEAFE' : '#F1F5F9',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            {getIcon(address.type)}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
              {address.recipientName}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
              }}
            >
              {address.type}
            </span>
            {address.isDefault && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                }}
              >
                Default
              </span>
            )}
          </div>

          <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: 1.4 }}>
            {address.addressLine}, {address.area}, {address.city} - {address.pincode}
          </p>

          {address.landmark && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#2563EB' }}>
                pin_drop
              </span>
              <span>Landmark: {address.landmark}</span>
            </div>
          )}

          {address.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                call
              </span>
              <span>{address.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '12px',
          marginTop: '4px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              Set as Default
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                edit
              </span>
              <span>Edit</span>
            </button>
          )}

          {!address.isDefault && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                delete
              </span>
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
