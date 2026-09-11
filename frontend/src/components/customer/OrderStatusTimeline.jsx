/**
 * OrderStatusTimeline Component
 * Vertical progression timeline for local delivery or store pickup orders.
 * Accurately matches Stitch Order Confirmation and Order Tracking styling.
 */
export default function OrderStatusTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div style={{ position: 'relative', paddingLeft: '24px' }}>
      {/* Connecting Vertical Line */}
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '12px',
          bottom: '24px',
          width: '2px',
          backgroundColor: '#E2E8F0',
          zIndex: 0,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {timeline.map((step, idx) => {
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                opacity: isCompleted || isCurrent ? 1 : 0.55,
              }}
            >
              {/* Node Icon */}
              <div
                style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent
                    ? '#2563EB'
                    : isCompleted
                    ? '#2563EB'
                    : '#FFFFFF',
                  border: isCompleted || isCurrent ? '2px solid #FFFFFF' : '2px solid #CBD5E1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent
                    ? '0 0 0 4px #DBEAFE'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  zIndex: 2,
                }}
              >
                {isCompleted && !isCurrent ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    check
                  </span>
                ) : isCurrent ? (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#CBD5E1',
                    }}
                  />
                )}
              </div>

              {/* Step Card Content */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: isCurrent ? '#EFF6FF' : '#F8FAFC',
                  border: isCurrent ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isCurrent ? '#1D4ED8' : '#172033',
                        margin: 0,
                      }}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          letterSpacing: '0.04em',
                        }}
                      >
                        In Progress
                      </span>
                    )}
                  </div>
                  {step.time && (
                    <span style={{ fontSize: '12px', color: isCurrent ? '#1D4ED8' : '#64748B', fontWeight: 500 }}>
                      {step.time}
                    </span>
                  )}
                </div>

                {step.note && (
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
