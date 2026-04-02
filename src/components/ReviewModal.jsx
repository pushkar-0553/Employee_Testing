import { HiX, HiOutlineCheckCircle } from 'react-icons/hi';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ReviewModal({ data, imagePreview, onConfirm, onCancel, isLoading }) {

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  useEffect(() => {
  document.title = "Review | Employee Management";
}, []);

  const fields = [
    { label: 'First Name', value: data.first_name },
    { label: 'Last Name', value: data.last_name },
    { label: 'Middle Name', value: data.middle_name || '—' },
    { label: 'Nickname', value: data.nick_name || '—' },
    { label: 'Role', value: data.role },
    { label: 'Phone Number', value: data.phone_number },
    { label: 'Blood Group', value: data.blood_group },
    { label: 'Date of Birth', value: data.dob },
    { label: 'Joining Date', value: data.date_of_joining },
    { label: 'Current Address', value: data.current_address },
    { label: 'Permanent Address', value: data.permanent_address },
  ];

  if (data.status === 'EXITED' || data.status === 0) {
    fields.push({ label: 'Exit Date', value: data.exit_date || '—' });
    fields.push({ label: 'Exit Reason', value: data.exit_reason || '—' });
  }

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
        className="modal-enter"
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <HiOutlineCheckCircle size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Review Employee Details
            </h2>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '1px' }}>
              Verify all information before saving
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
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            background: '#fafafa',
          }}
        >
          {imagePreview && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '3px solid white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {fields.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#0f172a',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
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
            background: 'white',
          }}
        >
          <button onClick={onCancel} className="btn-secondary">
            Go Back & Edit
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <div className="spinner" /> Saving...
              </>
            ) : (
              <>
                <HiOutlineCheckCircle size={16} /> Confirm & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}