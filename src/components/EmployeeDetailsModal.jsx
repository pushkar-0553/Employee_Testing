import { HiX, HiOutlineIdentification, HiOutlineCalendar, HiOutlineMap, HiOutlineLogout, HiOutlinePhone } from 'react-icons/hi';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function EmployeeDetailsModal({ employee, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!employee) return null;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
        <div style={{ color: '#2563eb' }}><Icon size={18} /></div>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {children}
      </div>
    </div>
  );

  const DataField = ({ label, value }) => (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>{label}</p>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{value || '—'}</div>
    </div>
  );

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div className="modal-enter" style={{
        background: '#ffffff', width: '100%', maxWidth: '640px',
        borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '20px', fontWeight: 800, flexShrink: 0,
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
            }}>
              {employee?.profile_picture 
                ? <img src={employee.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} alt="" />
                : `${(employee?.first_name || '?')[0]}${(employee?.last_name || '?')[0]}`
              }
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{employee.first_name} {employee.last_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <HiOutlinePhone size={14} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>+91 {employee.phone_number}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: 'none', background: '#f1f5f9', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', transition: 'all 0.2s'
          }}>
            <HiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <Section icon={HiOutlineIdentification} title="Personal Details">
            <DataField label="Full Name" value={`${employee?.first_name || ''} ${employee?.middle_name || ''} ${employee?.last_name || ''}`} />
            <DataField label="Nickname" value={employee?.nick_name} />
            <DataField label="Phone Number" value={employee?.phone_number ? `+91 ${employee.phone_number}` : '—'} />
            <DataField label="Blood Group" value={employee?.blood_group} />
            <DataField label="Date of Birth" value={formatDate(employee.dob)} />
          </Section>

          <Section icon={HiOutlineCalendar} title="Employment Info">
            <DataField label="Designation" value={employee?.role} />
            <DataField label="Employee ID" value={employee?.emp_id ? `#${employee.emp_id}` : '—'} />
            <DataField label="Joining Date" value={formatDate(employee?.date_of_joining)} />
            <DataField label="Current Status" value={
                <span style={{ 
                    color: employee.status === 1 ? '#059669' : '#dc2626',
                    background: employee.status === 1 ? '#ecfdf5' : '#fef2f2',
                    padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700
                }}>
                    {employee.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                </span>
            } />
          </Section>

          <Section icon={HiOutlineMap} title="Address Details">
            <div style={{ gridColumn: 'span 2' }}>
              <DataField label="Current Address" value={employee.current_address} />
            </div>
            <div style={{ gridColumn: 'span 2' , marginTop: '8px'}}>
              <DataField label="Permanent Address" value={employee.permanent_address} />
            </div>
          </Section>

          {employee.status === 0 && (
            <Section icon={HiOutlineLogout} title="Exit Records">
              <DataField label="Exit Date" value={formatDate(employee.exit_date)} />
              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <DataField label="Reason for Leaving" value={employee.exit_reason} />
              </div>
            </Section>
          )}

          <div style={{ marginTop: '8px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Created On</p>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(employee.created_at)}</div>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Last Updated</p>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(employee.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#ffffff' }}>
            <button onClick={onClose} className="btn-primary" style={{ minWidth: '120px' }}>Close Profile</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
