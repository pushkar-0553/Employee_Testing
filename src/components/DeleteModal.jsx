import { useState, useEffect } from 'react';
import { HiOutlineExclamation, HiX } from 'react-icons/hi';
import { createPortal } from 'react-dom';

export default function DeleteModal({ employee, onConfirm, onCancel, isLoading }) {

  const [typedName, setTypedName] = useState('');

  const fullName = `${employee.first_name} ${employee.last_name}`;
  const isMatch =
    typedName.trim().toLowerCase() === fullName.trim().toLowerCase();
  useEffect(() => {
  document.title = "Delete | Employee Management";
}, []);
  // Disable scroll when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <HiOutlineExclamation size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              Delete Employee
            </h2>
            <p
              style={{
                fontSize: '12.5px',
                color: '#94a3b8',
                marginTop: '2px',
              }}
            >
              This action cannot be undone
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
        <div style={{ padding: '20px 24px', background: '#fafafa' }}>
          <p
            style={{
              fontSize: '13.5px',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '18px',
            }}
          >
            You are permanently deleting{' '}
            <strong style={{ color: '#0f172a' }}>{fullName}</strong> from the
            system. All their data will be removed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              Type <strong>{fullName}</strong> to confirm
            </label>

            <input
              type="text"
              autoFocus
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={fullName}
              className="input-base"
              style={{ background: '#fff' }}
            />
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
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={!isMatch || isLoading}
            className="btn-danger"
          >
            {isLoading ? (
              <>
                <div className="spinner" /> Deleting...
              </>
            ) : (
              'Delete Employee'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}