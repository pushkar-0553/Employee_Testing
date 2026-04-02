import { useState, useEffect } from 'react';
import { HiOutlineLogout, HiX } from 'react-icons/hi';
import { createPortal } from 'react-dom';

export default function MarkExitedModal({ employee, onConfirm, onCancel, isLoading }) {
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitReason, setExitReason] = useState('');

  const fullName = `${employee?.first_name || ''} ${employee?.last_name || ''}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exitDate) return;
    onConfirm({ exit_date: exitDate, exit_reason: exitReason });
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}
          >
            <HiOutlineLogout size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              Mark as Exited
            </h2>
            <p
              style={{
                fontSize: '12.5px',
                color: '#94a3b8',
                marginTop: '2px',
              }}
            >
              Update employee status to EXITED
            </p>
          </div>

          <button
            onClick={onCancel}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            <HiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', background: '#fafafa' }}>
            <p
              style={{
                fontSize: '13.5px',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '18px',
              }}
            >
              You are marking <strong style={{ color: '#0f172a' }}>{fullName}</strong> as exited. Please provide the details below.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                  }}
                >
                  Exit Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="input-base"
                  style={{ background: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                  }}
                >
                  Exit Reason (Optional)
                </label>
                <textarea
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  placeholder="e.g. Resigned, Career Break, etc."
                  className="input-base"
                  style={{ background: '#fff', minHeight: '80px', paddingTop: '10px', resize: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: '#fff',
            }}
          >
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>

            <button
              type="submit"
              disabled={!exitDate || isLoading}
              className="btn-primary"
              style={{ background: '#ea580c', border: 'none' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" /> Updating...
                </>
              ) : (
                'Confirm Exit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
