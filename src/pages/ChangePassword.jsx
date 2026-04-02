import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi';
import { useEmployees } from '../context/EmployeeContext';

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="card" style={{ padding: '22px 24px' }}>
    <div className="section-header">
      <div className="section-header-icon"><Icon size={17} /></div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-header)' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, onToggleShow, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{label}<span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span></span>
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className={`input-base${error ? ' input-error' : ''}`}
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={onToggleShow}
        style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        {show ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
      </button>
    </div>
  </div>
);

export default function ChangePassword() {
  const navigate = useNavigate();
  const { changePassword } = useEmployees();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
  document.title = "Change Password | Employee Management";
}, []);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Required';
    if (!form.newPassword) errs.newPassword = 'Required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Required';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = changePassword(form.currentPassword, form.newPassword);
      if (result.success) {
        toast.success('Password updated successfully! Please login with your new password.');
        navigate('/login');
      } else {
        // Current password was wrong — show error on that field
        setErrors(prev => ({ ...prev, currentPassword: result.message }));
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button onClick={() => navigate(-1)} style={{
          width: '36px', height: '36px', borderRadius: '9px',
          background: 'white', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <HiOutlineArrowLeft size={17} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-header)', letterSpacing: '-0.02em' }}>Change Password</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>Update your password to keep your account secure.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Password Change Section */}
        <SectionCard icon={HiOutlineShieldCheck} title="Security Settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <PasswordField 
              label="Current Password" 
              name="currentPassword" 
              value={form.currentPassword} 
              onChange={handleChange} 
              show={showPassword.current}
              onToggleShow={() => toggleShowPassword('current')}
              error={errors.currentPassword} 
            />
            
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
            
            <PasswordField 
              label="New Password" 
              name="newPassword" 
              value={form.newPassword} 
              onChange={handleChange} 
              show={showPassword.new}
              onToggleShow={() => toggleShowPassword('new')}
              error={errors.newPassword} 
            />
            <PasswordField 
              label="Confirm New Password" 
              name="confirmPassword" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              show={showPassword.confirm}
              onToggleShow={() => toggleShowPassword('confirm')}
              error={errors.confirmPassword} 
            />
          </div>
        </SectionCard>

        {/* Security Notice */}
        <div className="card" style={{ 
          padding: '16px 20px', 
          background: '#fef3c7', 
          border: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#f59e0b', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <HiOutlineShieldCheck size={16} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>Security Notice</p>
            <p style={{ fontSize: '11.5px', color: '#78350f', lineHeight: 1.4 }}>
              Changing your password will end all active sessions and require you to sign in again.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary" style={{
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            <HiOutlineCheckCircle size={16} /> {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
